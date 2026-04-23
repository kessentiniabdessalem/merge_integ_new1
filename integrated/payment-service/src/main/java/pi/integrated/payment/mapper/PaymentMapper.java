package pi.integrated.payment.mapper;

import pi.integrated.payment.dto.PaymentDTO;
import pi.integrated.payment.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {
    
    public PaymentDTO toDTO(Payment payment) {
        if (payment == null) {
            return null;
        }
        
        PaymentDTO dto = new PaymentDTO();
        dto.setId(payment.getId());
        dto.setUserId(payment.getUserId());
        dto.setUserName(payment.getUserName());
        dto.setCourseId(payment.getCourseId());
        dto.setCourseTitle(payment.getCourseTitle());
        dto.setAmount(payment.getAmount());
        dto.setCurrency(payment.getCurrency());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setPaymentStatus(payment.getPaymentStatus());
        dto.setTransactionId(payment.getTransactionId());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setUpdatedAt(payment.getUpdatedAt());
        return dto;
    }
    
    public Payment toEntity(PaymentDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Payment payment = new Payment();
        payment.setId(dto.getId());
        payment.setUserId(dto.getUserId());
        payment.setUserName(dto.getUserName());
        payment.setCourseId(dto.getCourseId());
        payment.setCourseTitle(dto.getCourseTitle());
        payment.setAmount(dto.getAmount());
        payment.setCurrency(dto.getCurrency());
        payment.setPaymentMethod(dto.getPaymentMethod());
        payment.setPaymentStatus(dto.getPaymentStatus());
        payment.setTransactionId(dto.getTransactionId());
        payment.setPaymentDate(dto.getPaymentDate());
        payment.setCreatedAt(dto.getCreatedAt());
        payment.setUpdatedAt(dto.getUpdatedAt());
        return payment;
    }
}
