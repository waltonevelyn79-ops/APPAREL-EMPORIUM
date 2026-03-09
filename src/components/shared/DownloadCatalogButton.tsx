'use client';

import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';

interface DownloadCatalogButtonProps {
    productId?: string;           // Single product
    productIds?: string[];        // Multiple selected products
    categorySlug?: string;        // All products in a category
    label?: string;               // Button label override
    variant?: 'primary' | 'outline' | 'ghost';
    className?: string;
}

export default function DownloadCatalogButton({
    productId,
    productIds,
    categorySlug,
    label = 'Download Catalog',
    variant = 'primary',
    className = '',
}: DownloadCatalogButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            // Build query string
            const params = new URLSearchParams();
            if (productId) params.set('ids', productId);
            else if (productIds && productIds.length > 0) params.set('ids', productIds.join(','));
            else if (categorySlug) params.set('category', categorySlug);

            // Fetch catalog data from API
            const res = await fetch(`/api/catalog/generate?${params.toString()}`);
            const data = await res.json();

            if (!data.success) throw new Error(data.error || 'Failed to fetch catalog data');

            const { catalog } = data;

            // Dynamically import jsPDF (code-split — only loaded when user clicks)
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageW = doc.internal.pageSize.getWidth();
            const pageH = doc.internal.pageSize.getHeight();
            const margin = 15;
            let y = margin;

            // ── COVER PAGE ─────────────────────────────────────────────────
            // Deep navy header
            doc.setFillColor(27, 54, 93); // #1B365D
            doc.rect(0, 0, pageW, 60, 'F');

            // Company name
            doc.setTextColor(200, 169, 98); // #C8A962 gold
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text(catalog.company.name.toUpperCase(), pageW / 2, 25, { align: 'center' });

            // Tagline
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(catalog.company.tagline, pageW / 2, 35, { align: 'center' });

            // Product catalog title
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('PRODUCT CATALOG', pageW / 2, 48, { align: 'center' });

            y = 75;

            // Date line
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            const dateStr = `Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} | Total Products: ${catalog.productCount}`;
            doc.text(dateStr, pageW / 2, y, { align: 'center' });
            y += 8;

            // Horizontal rule
            doc.setDrawColor(27, 54, 93);
            doc.setLineWidth(0.5);
            doc.line(margin, y, pageW - margin, y);
            y += 10;

            // ── PRODUCT PAGES ───────────────────────────────────────────────
            for (let i = 0; i < catalog.products.length; i++) {
                const p = catalog.products[i];

                // Check if we need a new page (leave 60mm for content block)
                if (y + 60 > pageH - 20) {
                    doc.addPage();
                    y = margin;
                }

                // Product card background
                doc.setFillColor(248, 249, 250); // light grey
                doc.roundedRect(margin, y, pageW - margin * 2, 55, 3, 3, 'F');

                // Product number badge
                doc.setFillColor(27, 54, 93);
                doc.circle(margin + 7, y + 7, 5, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(7);
                doc.setFont('helvetica', 'bold');
                doc.text(`${i + 1}`, margin + 7, y + 9.5, { align: 'center' });

                // Category badge
                doc.setFillColor(200, 169, 98);
                doc.roundedRect(margin + 16, y + 3, 40, 5, 1, 1, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(6);
                doc.text(p.category.toUpperCase(), margin + 36, y + 6.5, { align: 'center' });

                // Product name
                doc.setTextColor(27, 54, 93);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                const nameLines = doc.splitTextToSize(p.name, pageW - margin * 2 - 70);
                doc.text(nameLines, margin + 16, y + 14);

                // Short description
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(80, 80, 80);
                const descLines = doc.splitTextToSize(p.shortDescription || '', pageW - margin * 2 - 70);
                doc.text(descLines.slice(0, 2), margin + 16, y + 22);

                // Specs (right side)
                const specs = p.specifications;
                const specKeys = Object.keys(specs).slice(0, 4);
                let specY = y + 14;
                doc.setFontSize(7);
                for (const key of specKeys) {
                    doc.setTextColor(120, 120, 120);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`${key}:`, pageW - margin - 55, specY);
                    doc.setTextColor(27, 54, 93);
                    doc.setFont('helvetica', 'bold');
                    doc.text(String(specs[key]).substring(0, 18), pageW - margin - 30, specY);
                    specY += 5.5;
                }

                // MOQ & Price bar at bottom
                doc.setFillColor(27, 54, 93);
                doc.rect(margin, y + 46, pageW - margin * 2, 7, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(7.5);
                doc.setFont('helvetica', 'bold');
                doc.text(`MOQ: ${p.minOrder || 'On Request'}`, margin + 4, y + 51);
                doc.text(`Price: ${p.priceRange || 'On Request'}`, margin + 60, y + 51);
                if (p.sku) doc.text(`SKU: ${p.sku}`, margin + 120, y + 51);

                y += 60; // Step down for next card
            }

            // ── FOOTER PAGE ─────────────────────────────────────────────────
            doc.addPage();
            doc.setFillColor(27, 54, 93);
            doc.rect(0, pageH - 50, pageW, 50, 'F');

            doc.setTextColor(200, 169, 98);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Contact Us', pageW / 2, pageH - 38, { align: 'center' });

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`📧 ${catalog.company.email}`, pageW / 2, pageH - 30, { align: 'center' });
            doc.text(`📞 ${catalog.company.phone}`, pageW / 2, pageH - 23, { align: 'center' });
            doc.text(`🌐 ${catalog.company.website}`, pageW / 2, pageH - 16, { align: 'center' });
            doc.text(`📍 ${catalog.company.address}`, pageW / 2, pageH - 9, { align: 'center' });

            // Save PDF
            const filename = `${catalog.company.name.replace(/\s+/g, '_')}_Catalog_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);

        } catch (error: any) {
            console.error('PDF generation error:', error);
            alert('Failed to generate PDF catalog. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const baseClass = 'inline-flex items-center gap-2 rounded-xl font-bold transition-all text-sm px-5 py-2.5 shadow-md disabled:opacity-60 disabled:cursor-not-allowed';
    const variantClass =
        variant === 'primary' ? 'bg-primary text-white hover:bg-secondary' :
            variant === 'outline' ? 'border-2 border-primary text-primary hover:bg-primary hover:text-white' :
                'text-primary hover:underline shadow-none';

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className={`${baseClass} ${variantClass} ${className}`}
            title="Download Product Catalog as PDF"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            {loading ? 'Generating PDF...' : label}
        </button>
    );
}
