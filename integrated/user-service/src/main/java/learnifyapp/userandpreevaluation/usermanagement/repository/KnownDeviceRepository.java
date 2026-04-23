package learnifyapp.userandpreevaluation.usermanagement.repository;

import learnifyapp.userandpreevaluation.usermanagement.entity.KnownDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface KnownDeviceRepository extends JpaRepository<KnownDevice, Long> {

    // 🔎 chercher un device précis
    Optional<KnownDevice> findByUserIdAndDeviceId(Long userId, String deviceId);

    // 🔎 vérifier si device précis existe
    boolean existsByUserIdAndDeviceId(Long userId, String deviceId);

    // ⭐ ⭐ ⭐ IMPORTANT ⭐ ⭐ ⭐
    // 👉 vérifier si l'utilisateur a AU MOINS un device connu
    // (permet de savoir si c'est le PREMIER device du compte)
    boolean existsByUserId(Long userId);

    // 🧹 supprimer tous les devices d'un user (avant delete user)
    @Modifying
    @Transactional
    @Query("delete from KnownDevice d where d.user.id = :userId")
    void deleteAllByUserId(Long userId);
}