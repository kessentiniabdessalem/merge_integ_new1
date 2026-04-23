package pi.integrated.certificate.mapper;

import pi.integrated.certificate.dto.CertificateDTO;
import pi.integrated.certificate.entity.Certificate;
import org.springframework.stereotype.Component;

@Component
public class CertificateMapper {
    
    public CertificateDTO toDTO(Certificate certificate) {
        if (certificate == null) {
            return null;
        }
        
        CertificateDTO dto = new CertificateDTO();
        dto.setId(certificate.getId());
        dto.setUserId(certificate.getUserId());
        dto.setUserName(certificate.getUserName());
        dto.setUserEmail(certificate.getUserEmail());
        dto.setCourseId(certificate.getCourseId());
        dto.setCourseTitle(certificate.getCourseTitle());
        dto.setCertificateNumber(certificate.getCertificateNumber());
        dto.setIssueDate(certificate.getIssueDate());
        dto.setCompletionDate(certificate.getCompletionDate());
        dto.setGrade(certificate.getGrade());
        dto.setStatus(certificate.getStatus());
        dto.setPdfPath(certificate.getPdfPath());
        dto.setVerificationCode(certificate.getVerificationCode());
        dto.setCreatedAt(certificate.getCreatedAt());
        dto.setUpdatedAt(certificate.getUpdatedAt());
        return dto;
    }
    
    public Certificate toEntity(CertificateDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Certificate certificate = new Certificate();
        certificate.setId(dto.getId());
        certificate.setUserId(dto.getUserId());
        certificate.setUserName(dto.getUserName());
        certificate.setUserEmail(dto.getUserEmail());
        certificate.setCourseId(dto.getCourseId());
        certificate.setCourseTitle(dto.getCourseTitle());
        certificate.setCertificateNumber(dto.getCertificateNumber());
        certificate.setIssueDate(dto.getIssueDate());
        certificate.setCompletionDate(dto.getCompletionDate());
        certificate.setGrade(dto.getGrade());
        certificate.setStatus(dto.getStatus());
        certificate.setPdfPath(dto.getPdfPath());
        certificate.setVerificationCode(dto.getVerificationCode());
        certificate.setCreatedAt(dto.getCreatedAt());
        certificate.setUpdatedAt(dto.getUpdatedAt());
        return certificate;
    }
}
