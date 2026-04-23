package learnifyapp.userandpreevaluation.usermanagement.controller;

import learnifyapp.userandpreevaluation.usermanagement.dto.PinRequest;
import learnifyapp.userandpreevaluation.usermanagement.service.AppPinService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/app-pin")
public class AppPinController {

    private final AppPinService pinService;

    public AppPinController(AppPinService pinService) {
        this.pinService = pinService;
    }

    // ✅ JWT required
    @PostMapping("/set")
    public ResponseEntity<?> set(@RequestBody PinRequest req, Authentication auth) {
        pinService.setPin(auth.getName(), req.getPin());
        return ResponseEntity.ok(Map.of("message", "PIN saved"));
    }

    // ✅ JWT required
    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody PinRequest req, Authentication auth) {
        boolean ok = pinService.verifyPin(auth.getName(), req.getPin());
        if (!ok) return ResponseEntity.status(401).body(Map.of("message", "Invalid PIN"));
        return ResponseEntity.ok(Map.of("message", "PIN OK"));
    }

    // ✅ JWT required (optionnel)
    @GetMapping("/status")
    public ResponseEntity<?> status(Authentication auth) {
        return ResponseEntity.ok(Map.of("hasPin", pinService.hasPin(auth.getName())));
    }
}