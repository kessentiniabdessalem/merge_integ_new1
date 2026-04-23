package learnifyapp.userandpreevaluation.usermanagement.dto;

import lombok.Data;

@Data
public class QrExchangeRequest {
    private String sessionId;
    private String exchangeCode;
}

