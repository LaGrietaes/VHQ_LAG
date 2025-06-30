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

type OutlineItem = {
    id: string;
    title: string;
    type: 'chapter' | 'section';
};

export type StagedFile = {
    file: File;
    parsedStructure: OutlineItem[];
};

type ImportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  stagedFiles: StagedFile[];
  onConfirmImport: (selectedItems: OutlineItem[]) => void;
};

export const ImportDialog = ({ isOpen, onClose, stagedFiles, onConfirmImport }: ImportDialogProps) => {
    const [selectedItems, setSelectedItems] = useState<{ [id: string]: boolean }>({});

    useEffect(() => {
        if (isOpen) {
            const allItems: { [id: string]: boolean } = {};
            stagedFiles.forEach(sf => {
                sf.parsedStructure.forEach(item => {
                    allItems[item.id] = true;
                });
            });
            setSelectedItems(allItems);
        }
    }, [isOpen, stagedFiles]);

    const handleConfirm = () => {
        const itemsToImport: OutlineItem[] = [];
        stagedFiles.forEach(sf => {
            sf.parsedStructure.forEach(item => {
                if (selectedItems[item.id]) {
                    itemsToImport.push(item);
                }
            });
        });
        onConfirmImport(itemsToImport);
    };
    
    const handleItemSelect = (id: string, isSelected: boolean) => {
        setSelectedItems(prev => ({...prev, [id]: isSelected}));
    }

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl bg-gray-900 border-gray-800 text-gray-300">
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
                                       <label htmlFor={item.id} className="text-sm">{item.title}</label>
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
            </DialogContent>
        </Dialog>
    );
}; 