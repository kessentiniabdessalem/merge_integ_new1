package pi.integrated.payment.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:noreply@learnifyenglish.com}")
    private String fromEmail;
    
    public void sendPaymentConfirmation(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("✅ Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("❌ Error sending email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }
    
    public void sendBatchPaymentConfirmation(String to, String userName, 
                                            String courses, double totalAmount, 
                                            String transactionId) {
        String subject = "Payment Confirmation - LearnifyEnglish";
        String htmlContent = buildPaymentConfirmationEmail(userName, courses, totalAmount, transactionId);
        sendPaymentConfirmation(to, subject, htmlContent);
    }
    
    private String buildPaymentConfirmationEmail(String userName, String courses, 
                                                 double totalAmount, String transactionId) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
                    .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
                    .footer { text-align: center; color: #777; font-size: 12px; margin-top: 20px; }
                    .button { background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; 
                             display: inline-block; margin: 20px 0; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Payment Confirmation</h1>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        <p>Thank you for your purchase! Your payment has been successfully processed.</p>
                        
                        <div class="details">
                            <h3>Order Details:</h3>
                            <p><strong>Courses:</strong><br>%s</p>
                            <p><strong>Total Amount:</strong> USD %.2f</p>
                            <p><strong>Transaction ID:</strong> %s</p>
                            <p><strong>Date:</strong> %s</p>
                        </div>
                        
                        <p>You can now access your courses from your dashboard.</p>
                        <a href="http://localhost:4200/my-courses" class="button">Go to My Courses</a>
                    </div>
                    <div class="footer">
                        <p>© 2026 LearnifyEnglish. All rights reserved.</p>
                        <p>If you have any questions, please contact support@learnifyenglish.com</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, courses, totalAmount, transactionId, 
                         java.time.LocalDateTime.now().format(
                             java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")));
    }
}
