package com.mounthospital;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.mounthospital.controller.AuthController;
import com.mounthospital.model.Patient;
import com.mounthospital.model.User;

@SpringBootApplication
public class MountHospitalApplication {
    public static void main(String[] args) {
        SpringApplication.run(MountHospitalApplication.class, args);
    }
}
