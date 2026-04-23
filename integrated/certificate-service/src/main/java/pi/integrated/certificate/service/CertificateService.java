package pi.integrated.certificate.service;

import pi.integrated.certificate.dto.CertificateDTO;
import pi.integrated.certificate.entity.Certificate;
import pi.integrated.certificate.exception.ResourceNotFoundException;
import pi.integrated.certificate.mapper.CertificateMapper;
import pi.integrated.certificate.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CertificateService {
    
    private final CertificateRepository certificateRepository;
    private final CertificateMapper certificateMapper;
    
    public List<CertificateDTO> getAllCertificates() {
        return certificateRepository.findAll()
                .stream()
                .map(certificateMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public CertificateDTO getCertificateById(Long id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found with id: " + id));
        return certificateMapper.toDTO(certificate);
    }
    
    @Transactional
    public CertificateDTO createCertificate(CertificateDTO certificateDTO) {
        Certificate certificate = certificateMapper.toEntity(certificateDTO);
        Certificate savedCertificate = certificateRepository.save(certificate);
        return certificateMapper.toDTO(savedCertificate);
    }
    
    @Transactional
    public void deleteCertificate(Long id) {
        if (!certificateRepository.existsById(id)) {
            throw new ResourceNotFoundException("Certificate not found with id: " + id);
        }
        certificateRepository.deleteById(id);
    }
    
    public Long getCertificateCount() {
        return certificateRepository.count();
    }
}
