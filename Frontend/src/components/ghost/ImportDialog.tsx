import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { OutlineItem } from "@/lib/ghost-agent-data";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export type StagedFile = {
    file: File;
    parsedStructure: OutlineItem[];
};

type ImportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  stagedFiles: StagedFile[];
  onImport: (selectedItems: OutlineItem[]) => Promise<void>;
};

export const ImportDialog = ({ isOpen, onClose, stagedFiles, onImport }: ImportDialogProps) => {
    const [selectedItems, setSelectedItems] = useState<{ [id: string]: boolean }>({});
    const [importState, setImportState] = useState<'selecting' | 'uploading' | 'success' | 'error'>('selecting');
    const [importMessage, setImportMessage] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            const allItems: { [id: string]: boolean } = {};
            stagedFiles.forEach(sf => {
                sf.parsedStructure.forEach(item => {
                    allItems[item.id] = true;
                });
            });
            setSelectedItems(allItems);
            setImportState('selecting');
            setImportMessage('');
        }
    }, [isOpen, stagedFiles]);

    // Auto-close dialog after success
    useEffect(() => {
        if (importState === 'success') {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [importState, onClose]);

    const handleConfirm = async () => {
        const itemsToImport: OutlineItem[] = [];
        stagedFiles.forEach(sf => {
            sf.parsedStructure.forEach(item => {
                if (selectedItems[item.id]) {
                    itemsToImport.push(item);
                }
            });
        });
        
        console.log('[ImportDialog] Items to import:', itemsToImport.map(item => ({
            id: item.id,
            title: item.title,
            type: item.type,
            hasContent: !!item.content,
            contentLength: item.content?.length || 0
        })));
        
        setImportState('uploading');
        setImportMessage('Importando archivos...');
        
        try {
            await onImport(itemsToImport);
            setImportState('success');
            setImportMessage(`Importación exitosa: ${itemsToImport.length} archivo${itemsToImport.length !== 1 ? 's' : ''} importado${itemsToImport.length !== 1 ? 's' : ''}.`);
        } catch (error) {
            setImportState('error');
            setImportMessage(`Error al importar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    };
    
    const handleItemSelect = (id: string, isSelected: boolean) => {
        setSelectedItems(prev => ({...prev, [id]: isSelected}));
    }

    if (!isOpen) return null;

    const renderContent = () => {
        switch (importState) {
            case 'selecting':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Importar Outline</DialogTitle>
                            <DialogDescription>
                                Revisa los archivos y selecciona los elementos del outline que quieres importar.
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] p-4 border border-gray-800 rounded-md">
                           {stagedFiles.map((stagedFile) => (
                               <div key={stagedFile.file.name} className="mb-4">
                                   <h4 className="font-bold text-red-500 mb-2">{stagedFile.file.name}</h4>
                                   <ul className="space-y-2">
                                       {stagedFile.parsedStructure.map(item => (
                                           <li key={item.id} className="flex items-center gap-2">
                                               <Checkbox
                                                    id={item.id}
                                                    checked={!!selectedItems[item.id]}
                                                    onCheckedChange={(checked) => handleItemSelect(item.id, !!checked)}
                                               />
                                               <div className="flex-1">
                                                   <label htmlFor={item.id} className="text-sm font-medium">{item.title}</label>
                                                   {item.content && (
                                                       <div className="text-xs text-gray-400 mt-1">
                                                           {item.content.length > 100 
                                                               ? `${item.content.substring(0, 100)}...` 
                                                               : item.content
                                                           }
                                                       </div>
                                                   )}
                                               </div>
                                           </li>
                                       ))}
                                   </ul>
                               </div>
                           ))}
                        </ScrollArea>
                        <DialogFooter>
                            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                            <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">Importar Selección</Button>
                        </DialogFooter>
                    </>
                );
            
            case 'uploading':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Importando Archivos</DialogTitle>
                            <DialogDescription>
                                Por favor espera mientras se importan los archivos...
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                            <p className="text-center text-gray-300">{importMessage}</p>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" disabled>Cancelar</Button>
                            <Button disabled className="bg-gray-600">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Importando...
                            </Button>
                        </DialogFooter>
                    </>
                );
            
            case 'success':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Importación Exitosa</DialogTitle>
                            <DialogDescription>
                                Los archivos se han importado correctamente.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                            <p className="text-center text-gray-300">{importMessage}</p>
                            <p className="text-center text-sm text-gray-400">
                                El diálogo se cerrará automáticamente en unos segundos...
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={onClose}>Cerrar Ahora</Button>
                        </DialogFooter>
                    </>
                );
            
                            case 'error':
                    return (
                        <>
                            <DialogHeader>
                                <DialogTitle>Error en la Importación</DialogTitle>
                                <DialogDescription>
                                    Ha ocurrido un error durante la importación.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <AlertCircle className="h-12 w-12 text-red-500" />
                                <div className="max-w-md">
                                    <p className="text-center text-gray-300 text-sm leading-relaxed break-words">
                                        {importMessage}
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setImportState('selecting')}>Volver</Button>
                                <Button onClick={onClose}>Cerrar</Button>
                            </DialogFooter>
                        </>
                    );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl bg-gray-900 border-gray-800 text-gray-300">
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
}; 