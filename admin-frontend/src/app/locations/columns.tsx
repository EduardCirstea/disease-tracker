'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Location } from '@/types/location';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { useToast } from '@/components/ui/use-toast';

export const columns: ColumnDef<Location>[] = [
  {
    accessorKey: 'name',
    header: 'Nume',
  },
  {
    accessorKey: 'city',
    header: 'Oraș',
  },
  {
    accessorKey: 'county',
    header: 'Județ',
  },
  {
    accessorKey: 'latitude',
    header: 'Latitudine',
  },
  {
    accessorKey: 'longitude',
    header: 'Longitudine',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const location = row.original;
      const router = useRouter();
      const { toast } = useToast();

      const handleDelete = async () => {
        try {
          await api.delete(`/admin/locations/${location.id}`);
          toast({
            title: 'Succes',
            description: 'Locația a fost ștearsă cu succes',
          });
          router.refresh();
        } catch (error) {
          toast({
            title: 'Eroare',
            description: 'Nu s-a putut șterge locația',
            variant: 'destructive',
          });
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Deschide meniul</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/locations/${location.id}/edit`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editează
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Șterge
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 