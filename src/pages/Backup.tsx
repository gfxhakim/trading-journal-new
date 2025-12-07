import React, { useState, useRef } from 'react';
import { exportAllData, importAllData } from '@/lib/db';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle,
  FileJson,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Backup: React.FC = () => {
  const { refreshData, accounts, trades, dailyNotes } = useApp();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trading-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Backup created",
        description: "Your data has been exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, mode: 'replace' | 'merge') => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setImportMode(mode);
      setConfirmDialogOpen(true);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!pendingFile) return;
    
    setIsImporting(true);
    setConfirmDialogOpen(false);
    
    try {
      const text = await pendingFile.text();
      const data = JSON.parse(text);
      
      // Validate data structure
      if (!data.accounts && !data.trades && !data.dailyNotes) {
        throw new Error('Invalid backup file format');
      }
      
      await importAllData(text, importMode === 'merge');
      await refreshData();
      
      toast({
        title: "Restore complete",
        description: importMode === 'merge' 
          ? "Data has been merged with existing records"
          : "Data has been restored successfully",
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setPendingFile(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Backup & Restore</h1>
        <p className="text-muted-foreground">
          Export your data for safekeeping or restore from a previous backup
        </p>
      </div>

      {/* Current Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Data</CardTitle>
          <CardDescription>Summary of data stored in your journal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold text-primary">{accounts.length}</div>
              <div className="text-sm text-muted-foreground">Accounts</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold text-primary">{trades.length}</div>
              <div className="text-sm text-muted-foreground">Trades</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold text-primary">{dailyNotes.length}</div>
              <div className="text-sm text-muted-foreground">Daily Reviews</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Download className="h-5 w-5 text-primary" />
            Export Backup
          </CardTitle>
          <CardDescription>
            Download all your data as a JSON file. Keep this file safe to restore your journal later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full sm:w-auto"
          >
            {isExporting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileJson className="mr-2 h-4 w-4" />
                Download Backup
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5 text-primary" />
            Restore from Backup
          </CardTitle>
          <CardDescription>
            Upload a backup file to restore your data. Choose between replacing all data or merging with existing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium mb-2">Replace All Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Completely replaces existing data with the backup. Existing data will be lost.
              </p>
              <label>
                <Button variant="outline" className="w-full" disabled={isImporting} asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Select File to Replace
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'replace')}
                  disabled={isImporting}
                />
              </label>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium mb-2">Merge with Existing</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adds backup data to existing records. Duplicate IDs will be overwritten.
              </p>
              <label>
                <Button variant="outline" className="w-full" disabled={isImporting} asChild>
                  <span>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Select File to Merge
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'merge')}
                  disabled={isImporting}
                />
              </label>
            </div>
          </div>

          {isImporting && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Importing data...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">Backup Tips</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Export your data regularly to prevent data loss</li>
                <li>Store backups in multiple locations (cloud storage, USB drive)</li>
                <li>The backup includes all accounts, trades, daily notes, and settings</li>
                <li>Backup files are plain JSON - you can view them in any text editor</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirm {importMode === 'replace' ? 'Restore' : 'Merge'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {importMode === 'replace' ? (
                <>
                  This will <strong>permanently delete</strong> all existing data and replace it with the backup file.
                  This action cannot be undone.
                </>
              ) : (
                <>
                  This will merge the backup data with your existing records. Items with the same ID will be overwritten.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingFile(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleImport}
              className={importMode === 'replace' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {importMode === 'replace' ? 'Replace All Data' : 'Merge Data'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Backup;
