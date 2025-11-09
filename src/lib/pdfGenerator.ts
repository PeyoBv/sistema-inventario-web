import jsPDF from 'jspdf'
import type { MovementLog } from './types'

export async function generateMovementsPDF(logs: MovementLog[], print: boolean = false) {
  const doc = new jsPDF()
  
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Reporte de Movimientos de Inventario', pageWidth / 2, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Últimas 6 horas', pageWidth / 2, 28, { align: 'center' })
  
  const now = new Date()
  const formattedDate = now.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  doc.text(`Generado: ${formattedDate}`, pageWidth / 2, 34, { align: 'center' })
  
  let yPosition = 48
  
  const totalEntradas = logs.filter(l => l.type === 'entrada').reduce((sum, l) => sum + l.quantityChange, 0)
  const totalSalidas = logs.filter(l => l.type === 'salida').reduce((sum, l) => sum + Math.abs(l.quantityChange), 0)
  const totalAjustes = logs.filter(l => l.type === 'ajuste').length
  
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, yPosition, contentWidth, 20, 'F')
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  
  const summaryX1 = margin + 10
  const summaryX2 = margin + contentWidth / 3 + 10
  const summaryX3 = margin + (contentWidth / 3) * 2 + 10
  
  doc.text('ENTRADAS', summaryX1, yPosition + 8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 100, 0)
  doc.text(`+${totalEntradas} unidades`, summaryX1, yPosition + 14)
  
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('SALIDAS', summaryX2, yPosition + 8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 0, 0)
  doc.text(`-${totalSalidas} unidades`, summaryX2, yPosition + 14)
  
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('AJUSTES', summaryX3, yPosition + 8)
  doc.setFont('helvetica', 'normal')
  doc.text(`${totalAjustes} movimientos`, summaryX3, yPosition + 14)
  
  yPosition += 30
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Detalle de Movimientos', margin, yPosition)
  yPosition += 8
  
  const tableHeaders = ['Fecha/Hora', 'Tipo', 'Item', 'Cantidad', 'Usuario']
  const colWidths = [38, 22, 60, 22, 28]
  const headerHeight = 8
  
  doc.setFillColor(60, 90, 150)
  doc.rect(margin, yPosition, contentWidth, headerHeight, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  
  let xPos = margin + 2
  tableHeaders.forEach((header, index) => {
    doc.text(header, xPos, yPosition + 5.5)
    xPos += colWidths[index]
  })
  
  yPosition += headerHeight
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  
  const rowHeight = 7
  const maxRowsPerPage = Math.floor((pageHeight - yPosition - margin) / rowHeight)
  
  if (logs.length === 0) {
    yPosition += 10
    doc.setTextColor(100, 100, 100)
    doc.text('No hay movimientos en las últimas 6 horas', pageWidth / 2, yPosition, { align: 'center' })
  } else {
    logs.forEach((log, index) => {
      if (index > 0 && index % maxRowsPerPage === 0) {
        doc.addPage()
        yPosition = margin
        
        doc.setFillColor(60, 90, 150)
        doc.rect(margin, yPosition, contentWidth, headerHeight, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        
        xPos = margin + 2
        tableHeaders.forEach((header, idx) => {
          doc.text(header, xPos, yPosition + 5.5)
          xPos += colWidths[idx]
        })
        
        yPosition += headerHeight
        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'normal')
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250)
        doc.rect(margin, yPosition, contentWidth, rowHeight, 'F')
      }
      
      const date = new Date(log.timestamp)
      const formattedDateTime = date.toLocaleString('es-ES', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      const typeLabels: Record<string, string> = {
        entrada: 'Entrada',
        salida: 'Salida',
        ajuste: 'Ajuste'
      }
      
      const itemNameTruncated = log.itemName.length > 30 
        ? log.itemName.substring(0, 27) + '...' 
        : log.itemName
      
      const usernameTruncated = log.username.length > 15
        ? log.username.substring(0, 12) + '...'
        : log.username
      
      xPos = margin + 2
      doc.text(formattedDateTime, xPos, yPosition + 5)
      xPos += colWidths[0]
      
      doc.text(typeLabels[log.type] || log.type, xPos, yPosition + 5)
      xPos += colWidths[1]
      
      doc.text(itemNameTruncated, xPos, yPosition + 5)
      xPos += colWidths[2]
      
      if (log.quantityChange > 0) {
        doc.setTextColor(0, 100, 0)
        doc.text(`+${log.quantityChange}`, xPos, yPosition + 5)
      } else {
        doc.setTextColor(200, 0, 0)
        doc.text(`${log.quantityChange}`, xPos, yPosition + 5)
      }
      doc.setTextColor(0, 0, 0)
      xPos += colWidths[3]
      
      doc.text(usernameTruncated, xPos, yPosition + 5)
      
      yPosition += rowHeight
    })
  }
  
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }
  
  if (print) {
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    const printWindow = window.open(pdfUrl)
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  } else {
    const filename = `reporte-movimientos-${now.toISOString().split('T')[0]}.pdf`
    doc.save(filename)
  }
}
