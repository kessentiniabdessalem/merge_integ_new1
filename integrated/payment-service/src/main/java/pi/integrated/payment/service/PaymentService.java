package pi.integrated.payment.service;

import pi.integrated.payment.dto.BatchPaymentRequest;
import pi.integrated.payment.dto.PaymentDTO;
import pi.integrated.payment.entity.Payment;
import pi.integrated.payment.exception.ResourceNotFoundException;
import pi.integrated.payment.mapper.PaymentMapper;
import pi.integrated.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final EmailService emailService;
    
    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(paymentMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public PaymentDTO getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        return paymentMapper.toDTO(payment);
    }
    
    @Transactional
    public PaymentDTO createPayment(PaymentDTO paymentDTO) {
        Payment payment = paymentMapper.toEntity(paymentDTO);
        Payment savedPayment = paymentRepository.save(payment);
        return paymentMapper.toDTO(savedPayment);
    }
    
    @Transactional
    public PaymentDTO updatePayment(Long id, PaymentDTO paymentDTO) {
        Payment existingPayment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        
        existingPayment.setUserId(paymentDTO.getUserId());
        existingPayment.setUserName(paymentDTO.getUserName());
        existingPayment.setCourseId(paymentDTO.getCourseId());
        existingPayment.setCourseTitle(paymentDTO.getCourseTitle());
        existingPayment.setAmount(paymentDTO.getAmount());
        existingPayment.setCurrency(paymentDTO.getCurrency());
        existingPayment.setPaymentMethod(paymentDTO.getPaymentMethod());
        existingPayment.setPaymentStatus(paymentDTO.getPaymentStatus());
        existingPayment.setTransactionId(paymentDTO.getTransactionId());
        
        Payment updatedPayment = paymentRepository.save(existingPayment);
        return paymentMapper.toDTO(updatedPayment);
    }
    
    @Transactional
    public void deletePayment(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Payment not found with id: " + id);
        }
        paymentRepository.deleteById(id);
    }
    
    public Double getTotalRevenue() {
        Double revenue = paymentRepository.calculateTotalRevenueByStatus("COMPLETED");
        return revenue != null ? revenue : 0.0;
    }
    
    public Long getPaymentCount() {
        return paymentRepository.count();
    }
    
    @Transactional
    public List<PaymentDTO> processBatchPayment(BatchPaymentRequest request) {
        log.info("Processing batch payment for user: {}, courses: {}", 
                 request.getUserId(), request.getCourses().size());
        
        List<PaymentDTO> createdPayments = new ArrayList<>();
        String batchTransactionId = generateBatchTransactionId();
        
        try {
            for (BatchPaymentRequest.CoursePaymentItem courseItem : request.getCourses()) {
                log.info("Creating payment for course: {}, amount: {}", 
                         courseItem.getCourseId(), courseItem.getAmount());
                
                Payment payment = new Payment();
                payment.setUserId(request.getUserId());
                payment.setUserName(request.getUserName());
                payment.setCourseId(courseItem.getCourseId());
                payment.setCourseTitle(courseItem.getCourseTitle());
                payment.setAmount(courseItem.getAmount());
                payment.setCurrency(request.getCurrency());
                payment.setPaymentMethod(request.getPaymentMethod());
                payment.setPaymentStatus("COMPLETED");
                payment.setTransactionId(batchTransactionId + "-" + courseItem.getCourseId());
                payment.setPaymentDate(LocalDateTime.now());
                
                Payment savedPayment = paymentRepository.save(payment);
                createdPayments.add(paymentMapper.toDTO(savedPayment));
                
                log.info("Successfully created payment ID: {} for course: {}", 
                         savedPayment.getId(), courseItem.getCourseId());
            }
            
            // Send email confirmation after successful payment
            try {
                String coursesList = request.getCourses().stream()
                    .map(c -> "• " + c.getCourseTitle() + " - $" + c.getAmount())
                    .collect(Collectors.joining("<br>"));
                
                // Note: In production, get user email from user service or request
                String userEmail = request.getUserEmail(); // Add this field to BatchPaymentRequest
                if (userEmail != null && !userEmail.isEmpty()) {
                    emailService.sendBatchPaymentConfirmation(
                        userEmail,
                        request.getUserName(),
                        coursesList,
                        request.getTotalAmount(),
                        batchTransactionId
                    );
                    log.info("Payment confirmation email sent to: {}", userEmail);
                }
            } catch (Exception emailError) {
                log.error("Failed to send confirmation email, but payment was successful: {}", 
                         emailError.getMessage());
                // Don't fail the payment if email fails
            }
            
            log.info("Batch payment completed. Total payments created: {}", createdPayments.size());
            return createdPayments;
        } catch (Exception e) {
            log.error("Error in processBatchPayment", e);
            throw new RuntimeException("Failed to process batch payment: " + e.getMessage(), e);
        }
    }
    
    private String generateBatchTransactionId() {
        return "BATCH-" + System.currentTimeMillis() + "-" + 
               UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
