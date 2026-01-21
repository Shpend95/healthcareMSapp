// In AuthController.java

@Autowired
private PatientRepository patientRepository; // Add this at the top with other @Autowired fields

// Then modify your register method:
@PostMapping("/register")
public ResponseEntity<?> registerUser(@RequestBody SignupRequest signupRequest) {
    // ... your existing validation code ...

    // Create new user account
    User user = new User(
            signupRequest.getUsername(),
            signupRequest.getEmail(),
            passwordEncoder.encode(signupRequest.getPassword())
    );

    Set<String> strRoles = signupRequest.getRoles();
    Set<Role> roles = new HashSet<>();

    // ... your existing role assignment code ...

    user.setRoles(roles);
    userRepository.save(user);

    // **ADD THIS**: Auto-create patient profile if role is PATIENT
    if (strRoles.contains("patient")) {
        Patient patient = new Patient();
        patient.setUser(user);
        patient.setFirstName(signupRequest.getFirstName() != null ? signupRequest.getFirstName() : "");
        patient.setLastName(signupRequest.getLastName() != null ? signupRequest.getLastName() : "");
        patient.setEmail(user.getEmail());
        patient.setDateOfBirth(signupRequest.getDateOfBirth());
        patient.setPhone(signupRequest.getPhone() != null ? signupRequest.getPhone() : "");
        patient.setAddress(signupRequest.getAddress() != null ? signupRequest.getAddress() : "");
        patientRepository.save(patient);
    }

    return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
}