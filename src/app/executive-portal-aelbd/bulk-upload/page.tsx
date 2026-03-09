'use client';

import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import * as xlsx from 'xlsx';

export default function BulkUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [data, setData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState<{ success: number, failed: number, errors: string[] }>({ success: 0, failed: 0, errors: [] });
    const [status, setStatus] = useState<'idle' | 'preview' | 'uploading' | 'done'>('idle');

    const handleFileUpload = (e: any) => {
        const uploadedFile = e.target.files?.[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = xlsx.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const parsedData = xlsx.utils.sheet_to_json(ws, { header: 1 }) as any[][];

                if (parsedData.length > 0) {
                    setHeaders(parsedData[0]);
                    // Transform rows into objects
                    const rows = parsedData.slice(1).filter(r => r.length > 0).map(row => {
                        let obj: any = {};
                        parsedData[0].forEach((h: string, i: number) => {
                            obj[h] = row[i];
                        });
                        return obj;
                    });
                    setData(rows);
                    setStatus('preview');
                }
            } catch (error) {
                alert('Failed to parse Excel file. Please make sure it is a valid .xlsx or .csv format.');
            }
        };
        reader.readAsBinaryString(uploadedFile);
    };

    const downloadTemplate = () => {
        const template = [
            ['Name', 'Category', 'ShortDescription', 'SKU', 'MOQ', 'Fabric', 'GSM', 'LeadTime', 'Colors', 'Sizes', 'Price']
        ];
        const ws = xlsx.utils.aoa_to_sheet(template);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Template');
        xlsx.writeFile(wb, 'Products_Upload_Template.xlsx');
    };

    const confirmUpload = async () => {
        setUploading(true);
        setStatus('uploading');
        setResults({ success: 0, failed: 0, errors: [] });

        try {
            const res = await fetch('/api/products/bulk-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: data })
            });

            const result = await res.json();
            setResults(result);
        } catch (error) {
            setResults(prev => ({ ...prev, errors: ['Failed to reach server for bulk upload'] }));
        } finally {
            setUploading(false);
            setStatus('done');
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bulk Upload Products</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Import multiple products at once using an Excel or CSV file.</p>

            {status === 'idle' && (
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-800">
                            <Upload className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Upload File</h3>
                        <p className="text-gray-500 text-sm mb-6">Upload your .xlsx or .csv file here. Max 10MB.</p>

                        <label className="bg-primary hover:bg-secondary text-white font-bold py-3 px-8 rounded-xl cursor-pointer transition-colors w-full shadow-sm flex items-center justify-center gap-2">
                            Browse Files
                            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>

                    <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-100 dark:border-green-800">
                            <FileSpreadsheet className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Download Template</h3>
                        <p className="text-gray-500 text-sm mb-6">Use our standard template to easily map your data.</p>

                        <button onClick={downloadTemplate} className="bg-white border-2 border-gray-200 dark:border-gray-700 hover:border-primary text-gray-700 dark:text-gray-300 font-bold py-3 px-8 rounded-xl transition-colors w-full flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" /> Download .xlsx
                        </button>
                    </div>
                </div>
            )}

            {status === 'preview' && (
                <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-[70vh]">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold">Data Preview</h3>
                            <p className="text-sm text-gray-500">Found {data.length} valid rows from {file?.name}</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => { setStatus('idle'); setFile(null); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-semibold">
                                Cancel
                            </button>
                            <button onClick={confirmUpload} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary text-sm font-semibold shadow flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Start Import
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-grow bg-gray-50 dark:bg-dark-bg p-4 inset-shadow-inner">
                        <table className="w-[150%] text-sm text-left">
                            <thead>
                                <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0">
                                    {headers.map((h, i) => <th key={i} className="px-4 py-3 font-semibold truncate border-r border-gray-100">{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {data.slice(0, 100).map((row, i) => (
                                    <tr key={i} className={`bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                                        {headers.map((h, j) => <td key={j} className="px-4 py-3 border-r border-gray-100 truncate max-w-[200px]" title={row[h]}>{row[h]}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {data.length > 100 && <p className="text-center p-4 text-sm text-gray-500">Showing first 100 rows preview...</p>}
                    </div>
                </div>
            )}

            {status === 'uploading' && (
                <div className="bg-white dark:bg-dark-surface p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center h-[50vh]">
                    <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
                    <h3 className="text-2xl font-bold mb-2">Importing Products...</h3>
                    <p className="text-gray-500">Please do not close this window. Processing {data.length} rows.</p>
                </div>
            )}

            {status === 'done' && (
                <div className="bg-white dark:bg-dark-surface p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${results.success > 0 ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                            {results.success > 0 ? <CheckCircle className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                        </div>
                        <h3 className="text-3xl font-bold mb-2">Import Complete</h3>
                        <p className="text-gray-500 text-lg">
                            Successfully imported <strong>{results.success}</strong> products.
                            {results.failed > 0 && <span className="text-red-500 ml-2">({results.failed} failed)</span>}
                        </p>
                    </div>

                    {results.errors?.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 max-h-60 overflow-y-auto">
                            <h4 className="font-bold text-red-800 mb-3 text-sm uppercase">Errors Report</h4>
                            <ul className="list-disc pl-5 text-sm text-red-700 space-y-1 mt-2">
                                {results.errors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-center gap-4">
                        <button onClick={() => setStatus('idle')} className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-bold transition-colors">
                            Upload Another
                        </button>
                        <button onClick={() => window.location.href = '/executive-portal-aelbd/products'} className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-secondary font-bold transition-colors shadow-sm">
                            View Products
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

