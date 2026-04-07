import { motion } from 'framer-motion';
import { FileDown, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { useState } from 'react';

function formatPrice(price) {
  if (price === 0) return 'Miễn phí';
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} triệu VND`;
  }
  return `${(price / 1000).toFixed(0)}.000 VND`;
}

export default function ExportPDF({ itinerary, query }) {
  const [isExporting, setIsExporting] = useState(false);

  const generatePDF = async () => {
    if (itinerary.length === 0) return;
    
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;
      
      // Title
      pdf.setFontSize(24);
      pdf.setTextColor(16, 185, 129); // emerald-500
      pdf.text('Vietnam AI Travel Planner', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Query
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128); // gray-500
      pdf.text(`Tim kiem: ${query || 'Hanh trinh du lich'}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      
      // Date
      const today = new Date().toLocaleDateString('vi-VN');
      pdf.text(`Ngay tao: ${today}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Separator
      pdf.setDrawColor(229, 231, 235);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      // Group items by category
      const hotels = itinerary.filter(item => item.category === 'Hotel');
      const restaurants = itinerary.filter(item => item.category === 'Restaurant');
      const attractions = itinerary.filter(item => item.category === 'Attraction');
      
      const sections = [
        { title: 'KHACH SAN', items: hotels, color: [59, 130, 246] },
        { title: 'QUAN AN', items: restaurants, color: [249, 115, 22] },
        { title: 'DIA DIEM THAM QUAN', items: attractions, color: [139, 92, 246] },
      ];
      
      for (const section of sections) {
        if (section.items.length === 0) continue;
        
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }
        
        // Section title
        pdf.setFontSize(16);
        pdf.setTextColor(...section.color);
        pdf.text(section.title, margin, yPosition);
        yPosition += 10;
        
        // Items
        for (const item of section.items) {
          if (yPosition > pageHeight - 50) {
            pdf.addPage();
            yPosition = margin;
          }
          
          // Item name
          pdf.setFontSize(13);
          pdf.setTextColor(31, 41, 55);
          pdf.text(`- ${item.name}`, margin + 5, yPosition);
          yPosition += 6;
          
          // Item details
          pdf.setFontSize(10);
          pdf.setTextColor(107, 114, 128);
          
          const addressLines = pdf.splitTextToSize(`  ${item.address}`, pageWidth - margin * 2 - 10);
          for (const line of addressLines) {
            pdf.text(line, margin + 5, yPosition);
            yPosition += 5;
          }
          
          pdf.text(`  Danh gia: ${item.score}/5`, margin + 5, yPosition);
          yPosition += 5;
          
          pdf.setTextColor(16, 185, 129);
          pdf.text(`  Gia: ${formatPrice(item.price_min)}`, margin + 5, yPosition);
          yPosition += 8;
        }
        
        yPosition += 5;
      }
      
      // Budget summary
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setDrawColor(229, 231, 235);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      const totalBudget = itinerary.reduce((sum, item) => sum + item.price_min, 0);
      
      pdf.setFontSize(16);
      pdf.setTextColor(16, 185, 129);
      pdf.text('TONG CHI PHI DU KIEN', margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(20);
      pdf.text(formatPrice(totalBudget), margin, yPosition);
      yPosition += 15;
      
      // Footer
      pdf.setFontSize(9);
      pdf.setTextColor(156, 163, 175);
      pdf.text(
        '* Gia co the thay doi. Day chi la uoc tinh dua tren muc gia thap nhat.',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      
      // Save
      pdf.save(`vietnam-travel-${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Có lỗi khi xuất PDF. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.button
      onClick={generatePDF}
      disabled={isExporting || itinerary.length === 0}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
        itinerary.length === 0
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl'
      }`}
      whileHover={itinerary.length > 0 ? { scale: 1.02 } : {}}
      whileTap={itinerary.length > 0 ? { scale: 0.98 } : {}}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang xuất...
        </>
      ) : (
        <>
          <FileDown className="h-5 w-5" />
          Xuất PDF
        </>
      )}
    </motion.button>
  );
}
