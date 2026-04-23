# 🔧 Correction de l'Erreur Multipart/Form-Data

## ❌ Erreur
```
Content-Type 'multipart/form-data;boundary=...;charset=UTF-8' is not supported
```

## ✅ Corrections Appliquées

### 1. Configuration WebConfig.java

Ajout de la configuration pour accepter multipart/form-data avec charset :

```java
@Bean
public StandardServletMultipartResolver multipartResolver() {
    return new StandardServletMultipartResolver();
}

@Override
public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
    for (HttpMessageConverter<?> converter : converters) {
        if (converter instanceof MappingJackson2HttpMessageConverter) {
            MappingJackson2HttpMessageConverter jsonConverter = 
                (MappingJackson2HttpMessageConverter) converter;
            jsonConverter.setSupportedMediaTypes(Arrays.asList(
                MediaType.APPLICATION_JSON,
                MediaType.APPLICATION_OCTET_STREAM,
                new MediaType("application", "*+json"),
                new MediaType("multipart", "form-data")
            ));
        }
    }
}
```

### 2. Configuration application.properties

Ajout des propriétés multipart :

```properties
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
spring.servlet.multipart.resolve-lazily=false

spring.mvc.contentnegotiation.favor-parameter=false
spring.mvc.contentnegotiation.favor-path-extension=false
```

### 3. EventController.java

Modification des méthodes `createEvent` et `update` pour accepter les paramètres individuellement au lieu d'une Map :

**Avant :**
```java
@PostMapping
public ResponseEntity<?> createEvent(
    @RequestParam(required = false) Map<String, String> params,
    @RequestParam(value = "photo", required = false) MultipartFile photo,
    @RequestBody(required = false) Event jsonBody)
```

**Après :**
```java
@PostMapping
public ResponseEntity<?> createEvent(
    @RequestParam(required = false) String name,
    @RequestParam(required = false) String category,
    @RequestParam(required = false) String status,
    // ... autres paramètres
    @RequestParam(value = "photo", required = false) MultipartFile photo,
    @RequestBody(required = false) Event jsonBody)
```

## 🚀 Pour Appliquer les Corrections

### 1. Arrêter le Backend

```bash
# Dans le terminal où tourne Spring Boot
Ctrl + C
```

### 2. Nettoyer et Recompiler

```bash
cd BackRahma
mvn clean install
```

### 3. Relancer le Backend

```bash
mvn spring-boot:run
```

### 4. Attendre le Démarrage

Attendre le message : `Started BackRahmaApplication`

## 🧪 Tester la Correction

### Test 1 : Avec curl (multipart/form-data)

```bash
curl -X POST http://localhost:8080/back/api/events \
  -F "name=Test Event" \
  -F "category=WORKSHOP" \
  -F "status=Upcoming" \
  -F "date=2026-05-01" \
  -F "placesLimit=100" \
  -F "description=Test Description" \
  -F "location=Test Location" \
  -F "organizerFirstName=John" \
  -F "organizerLastName=Doe"
```

### Test 2 : Avec JSON

```bash
curl -X POST http://localhost:8080/back/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Event JSON",
    "category": "WORKSHOP",
    "status": "Upcoming",
    "date": "2026-05-01",
    "placesLimit": 100,
    "description": "Test Description",
    "location": "Test Location",
    "organizerFirstName": "John",
    "organizerLastName": "Doe"
  }'
```

### Test 3 : Depuis le Frontend

```typescript
// Dans votre service Angular
const formData = new FormData();
formData.append('name', 'Test Event');
formData.append('category', 'WORKSHOP');
formData.append('status', 'Upcoming');
formData.append('date', '2026-05-01');
formData.append('placesLimit', '100');
formData.append('description', 'Test Description');
formData.append('location', 'Test Location');
formData.append('organizerFirstName', 'John');
formData.append('organizerLastName', 'Doe');

this.http.post('/api/events', formData).subscribe(
  response => console.log('Success:', response),
  error => console.error('Error:', error)
);
```

## ⚠️ Points Importants

### Context Path

Votre application utilise le context path `/back`, donc les URLs sont :

```
http://localhost:8080/back/api/events
```

Pas :
```
http://localhost:8080/api/events
```

### Proxy Frontend

Si vous utilisez le proxy dans `FrontOffice-main/proxy.conf.json`, vérifiez qu'il pointe vers le bon path :

```json
{
  "/api": {
    "target": "http://localhost:8080/back",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": "/api"
    }
  }
}
```

Ou plus simplement :

```json
{
  "/back": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

## 🔍 Vérification

### 1. Backend Démarré

```bash
curl http://localhost:8080/back/api/events
```

Devrait retourner la liste des événements (ou un tableau vide).

### 2. Logs Backend

Dans le terminal Spring Boot, vous devriez voir :

```
createEvent called; name=Test Event, photoPresent=false, jsonBody=null
```

### 3. Pas d'Erreur

Aucune erreur de type :
```
Content-Type 'multipart/form-data;...' is not supported
```

## 📚 Fichiers Modifiés

1. ✅ `BackRahma/src/main/java/pi/backrahma/config/WebConfig.java`
2. ✅ `BackRahma/src/main/resources/application.properties`
3. ✅ `BackRahma/src/main/java/pi/backrahma/Controller/EventController.java`
4. ✅ `BackRahma/src/main/java/pi/backrahma/dto/EventRequest.java` (nouveau)

## 🎯 Résultat Attendu

Après ces corrections, vous devriez pouvoir :

- ✅ Envoyer des requêtes multipart/form-data depuis le frontend
- ✅ Envoyer des requêtes JSON
- ✅ Uploader des fichiers (photos)
- ✅ Pas d'erreur de Content-Type

## 🆘 Si l'Erreur Persiste

### 1. Vérifier les Logs

Regardez les logs dans le terminal Spring Boot pour voir exactement quelle erreur se produit.

### 2. Vérifier le Context Path

Assurez-vous d'utiliser `/back/api/events` et non `/api/events`.

### 3. Nettoyer Complètement

```bash
cd BackRahma
mvn clean
rm -rf target/
mvn install
mvn spring-boot:run
```

### 4. Vérifier la Version de Spring Boot

```xml
<!-- pom.xml -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.2</version>
</parent>
```

## ✅ Checklist

- [ ] Backend arrêté
- [ ] `mvn clean install` exécuté
- [ ] Backend relancé
- [ ] Message "Started BackRahmaApplication" affiché
- [ ] Test curl réussi
- [ ] Test depuis frontend réussi
- [ ] Pas d'erreur dans les logs

---

**L'erreur devrait maintenant être corrigée ! 🎉**
