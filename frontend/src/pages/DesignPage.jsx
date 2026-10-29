import { useState } from "react";
import {
  Button,
  Input,
  Select,
  Field,
  Card,
  Badge,
  StatusPill,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Drawer,
  ConfirmDialog,
  Toast,
  KpiCard,
  PageHeader,
  EmptyState,
  Pagination,
  Money,
} from "../components/ui";

export default function DesignPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const columns = [
    { key: "sku", label: "SKU" },
    { key: "name", label: "Item" },
    { key: "qty", label: "On Hand" },
    { key: "status", label: "Status" },
  ];
  const rows = [
    { sku: "RTL-RCE-005", name: "Basmati Rice 5kg", qty: 9, status: "Low Stock" },
    { sku: "RTL-OIL-001", name: "Sunflower Oil 1L", qty: 55, status: "In Stock" },
    { sku: "MED-PARA-500", name: "Paracetamol 500mg", qty: 8, status: "Critical" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Design System"
        description="Primitive components available in this release."
        actions={
          <Button variant="ghost" onClick={() => setToast({ message: "Saved.", type: "success" })}>
            Save Preferences
          </Button>
        }
      />

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
          Buttons
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
          Inputs & Fields
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Item SKU" error="SKU is required.">
            <Input id="sku" placeholder="e.g. RTL-RCE-005" />
          </Field>
          <Field label="Category">
            <Select id="category">
              <option>Grocery & Staples</option>
              <option>Medical Relief</option>
              <option>Hardware & Electric</option>
            </Select>
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
          Cards, Badges & Status Pills
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <p className="text-xs text-[var(--text-muted)]">Card body</p>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill status="In Stock" />
            <StatusPill status="Low Stock" />
            <StatusPill status="Critical" />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
          Table
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key}>{c.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.sku}>
                <TableCell>{row.sku}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell className="tabular-nums">{row.qty}</TableCell>
                <TableCell>
                  <StatusPill status={row.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
          KPI Cards
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard title="Catalog SKUs" value="124" subtitle="Active items tracked" trend="Live Synced" />
          <KpiCard title="Low Stock" value={3} subtitle="Requires restock" trend="Action Needed" />
          <KpiCard title="Stock Value" value="â‚¹1,24,500.00" subtitle="Combined inventory value" />
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
          Money
        </h3>
        <div className="flex items-center gap-4">
          <Money amount={124500} currency="INR" />
          <Money amount={45.5} currency="USD" />
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
          Empty State
        </h3>
        <EmptyState
          title="No records found"
          description="Try adjusting your filters or create your first item."
          action={<Button variant="secondary">Create Item</Button>}
        />
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
          Drawer & Dialog
        </h3>
        <div className="flex gap-3">
          <Button onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Confirm Delete
          </Button>
        </div>
        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Item Details"
          placement="right"
        >
          <p className="text-sm text-[var(--text-secondary)]">Drawer content goes here.</p>
        </Drawer>
        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            setToast({ message: "Item deleted.", type: "success" });
          }}
          title="Delete Item"
          message="This action cannot be undone. The SKU will be removed from the catalog."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          danger
        />
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
          Toast
        </h3>
        <div className="flex gap-3">
          <Button onClick={() => setToast({ message: "Changes saved.", type: "success" })}>
            Show Success
          </Button>
          <Button variant="danger" onClick={() => setToast({ message: "Save failed.", type: "error" })}>
            Show Error
          </Button>
        </div>
        <Toast toast={toast} onClose={() => setToast(null)} />
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elev)] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
          Pagination
        </h3>
        <Pagination page={2} totalPages={10} onChange={(p) => console.log("page", p)} />
      </section>
    </div>
  );
}

