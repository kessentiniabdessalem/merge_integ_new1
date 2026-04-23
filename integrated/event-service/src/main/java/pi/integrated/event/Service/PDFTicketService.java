package pi.integrated.event.Service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.layout.properties.TextAlignment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pi.integrated.event.entity.Reservation;

import java.io.ByteArrayOutputStream;

@Service
public class PDFTicketService {

    @Autowired
    private QRCodeService qrCodeService;

    public byte[] generateTicketPDF(Reservation reservation) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Titre
            Paragraph title = new Paragraph("TICKET D'ÉVÉNEMENT")
                    .setFontSize(24)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.BLUE);
            document.add(title);

            // Informations de l'événement
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Événement: " + reservation.getEvent().getName())
                    .setFontSize(16).setBold());
            document.add(new Paragraph("Date: " + reservation.getEvent().getDate().toString())
                    .setFontSize(12));
            document.add(new Paragraph("Lieu: " + reservation.getEvent().getLocation())
                    .setFontSize(12));
            document.add(new Paragraph("\n"));

            // Informations du participant
            document.add(new Paragraph("Participant: " + reservation.getParticipant().getFullName())
                    .setFontSize(14).setBold());
            document.add(new Paragraph("Email: " + reservation.getParticipant().getEmail())
                    .setFontSize(12));
            document.add(new Paragraph("\n"));

            // Code du ticket
            document.add(new Paragraph("Code du ticket: " + reservation.getTicketCode())
                    .setFontSize(14)
                    .setBold()
                    .setFontColor(ColorConstants.RED));
            document.add(new Paragraph("\n"));

            // Génération du QR Code
            String qrContent = "TICKET:" + reservation.getTicketCode() + 
                             "|EVENT:" + reservation.getEvent().getId() + 
                             "|PARTICIPANT:" + reservation.getParticipant().getId();
            byte[] qrCodeBytes = qrCodeService.generateQRCode(qrContent, 200, 200);
            Image qrImage = new Image(ImageDataFactory.create(qrCodeBytes));
            qrImage.setTextAlignment(TextAlignment.CENTER);
            document.add(qrImage);

            // Footer
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Présentez ce ticket à l'entrée de l'événement")
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setItalic());

            document.close();
            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF: " + e.getMessage(), e);
        }
    }
}
