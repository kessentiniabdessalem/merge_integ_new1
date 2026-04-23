package learnifyapp.userandpreevaluation.usermanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QrStatusResponse {
    private String status;
    private String exchangeCode;
}

