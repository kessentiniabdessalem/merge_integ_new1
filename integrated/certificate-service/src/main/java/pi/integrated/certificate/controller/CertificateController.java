package pi.integrated.certificate.controller;

import pi.integrated.certificate.dto.ApiResponse;
import pi.integrated.certificate.dto.CertificateDTO;
import pi.integrated.certificate.service.CertificateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
@Tag(name = "Certificate Management", description = "APIs for managing certificates")
public class CertificateController {
    
    private final CertificateService certificateService;
    
    @GetMapping
    @Operation(summary = "Get all certificates")
    public ResponseEntity<ApiResponse<List<CertificateDTO>>> getAllCertificates() {
        List<CertificateDTO> certificates = certificateService.getAllCertificates();
        return ResponseEntity.ok(ApiResponse.success(certificates));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get certificate by ID")
    public ResponseEntity<ApiResponse<CertificateDTO>> getCertificateById(@PathVariable Long id) {
        CertificateDTO certificate = certificateService.getCertificateById(id);
        return ResponseEntity.ok(ApiResponse.success(certificate));
    }
    
    @PostMapping
    @Operation(summary = "Create new certificate")
    public ResponseEntity<ApiResponse<CertificateDTO>> createCertificate(@Valid @RequestBody CertificateDTO certificateDTO) {
        CertificateDTO createdCertificate = certificateService.createCertificate(certificateDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Certificate created successfully", createdCertificate));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete certificate")
    public ResponseEntity<ApiResponse<Void>> deleteCertificate(@PathVariable Long id) {
        certificateService.deleteCertificate(id);
        return ResponseEntity.ok(ApiResponse.success("Certificate deleted successfully", null));
    }
    
    @GetMapping("/count")
    @Operation(summary = "Get total certificate count")
    public ResponseEntity<ApiResponse<Long>> getCertificateCount() {
        Long count = certificateService.getCertificateCount();
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
