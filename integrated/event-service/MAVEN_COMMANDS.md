# 🔧 Commandes Maven - Module Event

## 📦 Gestion des Dépendances

### Installer les dépendances
```bash
mvn clean install
```

### Mettre à jour les dépendances
```bash
mvn clean install -U
```

### Afficher l'arbre des dépendances
```bash
mvn dependency:tree
```

### Vérifier les dépendances obsolètes
```bash
mvn versions:display-dependency-updates
```

## 🚀 Compilation et Exécution

### Compiler le projet
```bash
mvn compile
```

### Compiler sans tests
```bash
mvn clean install -DskipTests
```

### Lancer l'application
```bash
mvn spring-boot:run
```

### Lancer avec un profil spécifique
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Lancer sur un port différent
```bash
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

## 🧪 Tests

### Lancer tous les tests
```bash
mvn test
```

### Lancer un test spécifique
```bash
mvn test -Dtest=ReservationServiceTest
```

### Lancer une méthode de test spécifique
```bash
mvn test -Dtest=ReservationServiceTest#shouldCreateReservationSuccessfully
```

### Tests avec rapport de couverture
```bash
mvn clean test jacoco:report
```

### Ignorer les tests
```bash
mvn clean install -DskipTests
```

## 📦 Packaging

### Créer un JAR
```bash
mvn clean package
```

### Créer un JAR sans tests
```bash
mvn clean package -DskipTests
```

### Créer un JAR exécutable
```bash
mvn clean package spring-boot:repackage
```

### Lancer le JAR
```bash
java -jar target/BackRahma-0.0.1-SNAPSHOT.jar
```

## 🧹 Nettoyage

### Nettoyer le projet
```bash
mvn clean
```

### Nettoyer et supprimer les dépendances locales
```bash
mvn clean dependency:purge-local-repository
```

## 🔍 Analyse et Qualité

### Vérifier le style de code
```bash
mvn checkstyle:check
```

### Analyser avec SpotBugs
```bash
mvn spotbugs:check
```

### Générer le site de documentation
```bash
mvn site
```

## 🐛 Debug

### Lancer en mode debug
```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

### Afficher les logs détaillés
```bash
mvn spring-boot:run -X
```

### Afficher les propriétés Maven
```bash
mvn help:effective-pom
```

## 📊 Rapports

### Générer le rapport de tests
```bash
mvn surefire-report:report
```

### Générer le rapport de couverture
```bash
mvn jacoco:report
```

### Ouvrir le rapport de couverture
```bash
# Le rapport est dans: target/site/jacoco/index.html
```

## 🔄 Mise à jour

### Mettre à jour la version du projet
```bash
mvn versions:set -DnewVersion=1.0.1
```

### Mettre à jour les versions des dépendances
```bash
mvn versions:use-latest-releases
```

## 🚢 Déploiement

### Créer un package pour production
```bash
mvn clean package -Pprod -DskipTests
```

### Vérifier le package
```bash
mvn verify
```

## 🔧 Utilitaires

### Afficher la version de Maven
```bash
mvn --version
```

### Afficher l'aide
```bash
mvn help:help
```

### Afficher les plugins disponibles
```bash
mvn help:describe -Dplugin=spring-boot
```

## 📝 Scripts Utiles

### Script de build complet
```bash
#!/bin/bash
echo "🔨 Build complet du projet..."
mvn clean install
echo "✅ Build terminé !"
```

### Script de test et rapport
```bash
#!/bin/bash
echo "🧪 Lancement des tests..."
mvn clean test
mvn jacoco:report
echo "📊 Rapport de couverture généré dans target/site/jacoco/index.html"
```

### Script de déploiement
```bash
#!/bin/bash
echo "🚀 Déploiement..."
mvn clean package -DskipTests
java -jar target/BackRahma-0.0.1-SNAPSHOT.jar
```

## 🎯 Commandes Fréquentes

### Développement quotidien
```bash
# Démarrage rapide
mvn spring-boot:run

# Recompiler après modification
mvn compile

# Tester une fonctionnalité
mvn test -Dtest=ReservationServiceTest
```

### Avant un commit
```bash
# Vérifier que tout fonctionne
mvn clean install

# Vérifier les tests
mvn test

# Vérifier le style
mvn checkstyle:check
```

### Avant un déploiement
```bash
# Build complet
mvn clean package -DskipTests

# Vérifier le JAR
java -jar target/BackRahma-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## 🔍 Troubleshooting

### Problème de dépendances
```bash
# Nettoyer le cache Maven
mvn dependency:purge-local-repository

# Forcer la mise à jour
mvn clean install -U
```

### Problème de compilation
```bash
# Nettoyer complètement
mvn clean

# Recompiler
mvn compile
```

### Problème de tests
```bash
# Lancer les tests en verbose
mvn test -X

# Ignorer les tests temporairement
mvn clean install -DskipTests
```

## 📚 Ressources

- [Maven Documentation](https://maven.apache.org/guides/)
- [Spring Boot Maven Plugin](https://docs.spring.io/spring-boot/docs/current/maven-plugin/reference/html/)
- [Maven Lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)

---

**Astuce:** Créez des alias dans votre `.bashrc` ou `.zshrc` :

```bash
alias mvn-run='mvn spring-boot:run'
alias mvn-test='mvn test'
alias mvn-build='mvn clean install'
alias mvn-package='mvn clean package -DskipTests'
```
