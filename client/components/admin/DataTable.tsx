import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/uiAdmin/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/uiAdmin/card";
import { Badge } from "@/components/uiAdmin/badge";
import { Button } from "@/components/uiAdmin/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/uiAdmin/dropdown-menu";

interface DataTableProps {
  title: string;
  data: Array<{
    id: string;
    name: string;
    email?: string;
    status: "active" | "inactive" | "pending";
    date: string;
    amount?: string;
  }>;
}

export function DataTable({ title, data }: DataTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {data[0]?.email && <TableHead>Email</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              {data[0]?.amount && <TableHead>Amount</TableHead>}
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                {item.email && (
                  <TableCell className="text-muted-foreground">
                    {item.email}
                  </TableCell>
                )}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusColor(item.status)}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.date}
                </TableCell>
                {item.amount && (
                  <TableCell className="font-medium">{item.amount}</TableCell>
                )}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
