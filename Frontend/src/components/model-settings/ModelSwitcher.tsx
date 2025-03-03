"use client";

import * as React from "react";
import { useState } from "react"; // Добавлен useState
import { Check, ChevronsUpDown, MoreVertical, Pencil, Trash, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BlenderModel } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface ComboboxOption {
  value: string;
  label: string;
  isModel?: boolean;
}

interface ModelSwitcherProps {
  options: BlenderModel[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  onAddModel?: () => void;
  onEditModel?: (id: number) => void;
  onDeleteModel?: (id: number) => void;
  showModelActions?: boolean;
}

export function ModelSwitcher({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  onAddModel,
  onEditModel,
  onDeleteModel,
  showModelActions = false,
}: ModelSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<BlenderModel | null>(null); // Состояние для хранения модели, которую нужно удалить

  const handleDeleteClick = (model: BlenderModel) => {
    setModelToDelete(model); // Сохраняем модель для удаления
    setShowDeleteDialog(true); // Открываем диалог подтверждения удаления
  };

  const handleConfirmDelete = () => {
    if (modelToDelete && onDeleteModel) {
      onDeleteModel(modelToDelete.id); // Вызываем функцию удаления
    }
    setShowDeleteDialog(false); // Закрываем диалог
    setModelToDelete(null); // Сбрасываем модель для удаления
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {value ? options.find((option) => option.modelType === value)?.modelType : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>No option found.</CommandEmpty>
            </CommandList>
            <CommandList>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    onSelect={() => {
                      onValueChange(option.modelType);
                      setOpen(false);
                    }}
                    className="flex justify-between"
                  >
                    <div className="flex items-center">
                      <Check className={cn("mr-2 h-4 w-4", value === option.modelType ? "opacity-100" : "opacity-0")} />
                      {option.modelType}
                    </div>
                    {showModelActions && (onEditModel || onDeleteModel) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 hover:bg-transparent ml-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          {onEditModel && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditModel(option.id);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              Изменить
                            </DropdownMenuItem>
                          )}
                          {onDeleteModel && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(option); // Используем новую функцию для удаления
                              }}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4" />
                              Удалить
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {showModelActions && onAddModel && (
              <>
                <CommandSeparator />
                <CommandList>
                  <CommandGroup>
                    <CommandItem onSelect={onAddModel}>
                      <Plus className="h-4 w-4" />
                      Добавить модель
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="w-[calc(100%-2rem)] sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Удаление модели</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить эту модель? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="sm:mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete} // Используем новую функцию для подтверждения удаления
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}