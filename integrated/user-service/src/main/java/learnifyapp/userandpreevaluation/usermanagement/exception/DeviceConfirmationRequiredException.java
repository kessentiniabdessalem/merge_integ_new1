package learnifyapp.userandpreevaluation.usermanagement.exception;

public class DeviceConfirmationRequiredException extends RuntimeException {

    private final String token;

    public DeviceConfirmationRequiredException(String token) {
        super("Device confirmation required");
        this.token = token;
    }

    public String getToken() {
        return token;
    }
}