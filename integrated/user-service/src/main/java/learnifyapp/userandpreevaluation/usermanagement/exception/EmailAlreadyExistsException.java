package learnifyapp.userandpreevaluation.usermanagement.exception;

public class EmailAlreadyExistsException extends RuntimeException {

    public EmailAlreadyExistsException() {
        super("This email is already registered. Try signing in.");
    }
}
