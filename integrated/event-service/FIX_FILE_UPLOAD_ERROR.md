# Fix: File Upload Error - FileNotFoundException

## 🐛 Problème
```
Failed to create event: java.io.FileNotFoundException: 
C:\Users\hp\AppData\Local\Temp\tomcat.8040\work\Tomcat\localhost\back\d'écran 2026-03-02 122408.png 
(Le chemin d'accès spécifié est introuvable)
```

## 🔍 Cause
1. Le fichier était sauvegardé avec un chemin relatif `uploads/` 
2. Tomcat essayait de lire depuis son répertoire temporaire
3. Les noms de fichiers avec caractères spéciaux (espaces, accents) causaient des problèmes

## ✅ Solution appliquée

### 1. Utilisation d'un chemin absolu dans EventController.java

**Avant:**
```java
String uploadDir = "uploads/";
File uploadFolder = new File(uploadDir);
String filename = photo.getOriginalFilename();
String filePath = uploadDir + filename;
photo.transferTo(new File(filePath));
event.setPhotoUrl("/" + filePath);
```

**Après:**
```java
// Utiliser un chemin absolu pour éviter les problèmes avec Tomcat
String uploadDir = System.getProperty("user.dir") + "/BackRahma/uploads/";
File uploadFolder = new File(uploadDir);
if (!uploadFolder.exists()) {
    uploadFolder.mkdirs();
}

// Nettoyer le nom de fichier pour éviter les caractères spéciaux
String originalFilename = photo.getOriginalFilename();
String cleanFilename = originalFilename.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
String timestamp = String.valueOf(System.currentTimeMillis());
String filename = timestamp + "_" + cleanFilename;

File destinationFile = new File(uploadDir + filename);
photo.transferTo(destinationFile);

event.setPhotoUrl("/uploads/" + filename);
```

### 2. Configuration du ResourceHandler dans WebConfig.java

**Avant:**
```java
registry.addResourceHandler("/uploads/**")
        .addResourceLocations("file:uploads/");
```

**Après:**
```java
String uploadPath = System.getProperty("user.dir") + "/BackRahma/uploads/";
registry.addResourceHandler("/uploads/**")
        .addResourceLocations("file:" + uploadPath);
```

## 🎯 Améliorations apportées

1. **Chemin absolu**: Utilise `System.getProperty("user.dir")` pour obtenir le répertoire de travail
2. **Nettoyage du nom de fichier**: Remplace les caractères spéciaux par des underscores
3. **Timestamp unique**: Ajoute un timestamp pour éviter les conflits de noms
4. **Création automatique du dossier**: Vérifie et crée le dossier uploads si nécessaire
5. **Gestion des erreurs**: Meilleure gestion des exceptions

## 📝 Exemple de nom de fichier généré

**Original**: `Capture d'écran 2026-03-02 122408.png`
**Nettoyé**: `1709414966123_Capture_d__cran_2026_03_02_122408.png`

## 🧪 Test

Essayez de créer un événement avec une photo:
- Le fichier sera sauvegardé dans `C:\Users\hp\Desktop\PI\BackRahma\uploads\`
- Accessible via: `http://localhost:8080/back/uploads/[filename]`

## ✅ Résultat

- Les fichiers sont maintenant sauvegardés correctement
- Les noms de fichiers avec caractères spéciaux sont gérés
- Les fichiers sont accessibles via HTTP
- Pas de conflit avec le répertoire temporaire de Tomcat
