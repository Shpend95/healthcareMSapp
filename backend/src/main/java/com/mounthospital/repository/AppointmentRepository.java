package com.mounthospital.repository;

import com.mounthospital.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctorId(Long doctorId);
    
    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate = :date AND a.doctorId = :doctorId")
    List<Appointment> findByAppointmentDateAndDoctorId(@Param("date") LocalDate date, @Param("doctorId") Long doctorId);
}
