package learnifyapp.userandpreevaluation.usermanagement.controller;

import learnifyapp.userandpreevaluation.usermanagement.dto.RegisterRequest;
import learnifyapp.userandpreevaluation.usermanagement.dto.UserResponse;
import learnifyapp.userandpreevaluation.usermanagement.entity.User;
import learnifyapp.userandpreevaluation.usermanagement.service.UserService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/create-tutor")
    public User createTutor(@RequestBody RegisterRequest request) {
        return userService.createTutor(request);
    }

    @PostMapping("/create-admin")
    public User createAdmin(@RequestBody RegisterRequest request) {
        return userService.createAdmin(request);
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return users.stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    private UserResponse toUserResponse(User u) {
        if (u == null) return null;
        UserResponse r = new UserResponse();
        r.setId(u.getId());
        r.setFirstName(u.getFirstName() != null ? u.getFirstName() : "");
        r.setLastName(u.getLastName() != null ? u.getLastName() : "");
        r.setEmail(u.getEmail() != null ? u.getEmail() : "");
        r.setRole(u.getRole() != null ? u.getRole().name() : null);
        r.setAvatarUrl(u.getAvatarUrl());
        return r;
    }

    // ✅ NEW
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}
