package com.mounthospital.controller;

import com.mounthospital.model.Nurse;
import com.mounthospital.repository.NurseRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/nurses")
@CrossOrigin(origins = "http://localhost:3000")
public class NurseController {
    @Autowired
    private NurseRepository nurseRepository;

    @GetMapping
    public List<Nurse> getAllNurses() {
        return nurseRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Nurse> getNurseById(@PathVariable Long id) {
        Optional<Nurse> nurse = nurseRepository.findById(id);
        return nurse.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Nurse createNurse(@Valid @RequestBody Nurse nurse) {
        return nurseRepository.save(nurse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Nurse> updateNurse(@PathVariable Long id, 
                                            @Valid @RequestBody Nurse nurseDetails) {
        Optional<Nurse> optionalNurse = nurseRepository.findById(id);
        if (optionalNurse.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Nurse nurse = optionalNurse.get();
        nurse.setName(nurseDetails.getName());
        nurse.setEmail(nurseDetails.getEmail());
        nurse.setPhone(nurseDetails.getPhone());
        nurse.setDepartment(nurseDetails.getDepartment());

        return ResponseEntity.ok(nurseRepository.save(nurse));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNurse(@PathVariable Long id) {
        if (!nurseRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        nurseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
