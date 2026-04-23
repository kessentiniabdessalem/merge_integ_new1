package pi.integrated.preevaluation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class FollowUpChatRequest {
    @NotNull
    private Long questionId;
    @NotBlank
    private String initialExplanation;
    private List<ChatMessageDto> priorMessages;
    @NotBlank
    private String userMessage;
}
