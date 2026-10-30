"use client";

import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/contexts/settings-context";
import { useFieldChainNav } from "@/hooks/use-field-chain-nav";

export default function SettingsPage() {
  const { settings, loading, error, updateSettings, refetch } = useSettings();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // 0 name, 1 phone, 2 whatsapp, 3 email, 4 license number, 5 save button.
  // Address is a Textarea, deliberately left out of the chain (see hook comment).
  const { registerRef, handleKeyDown } = useFieldChainNav(6);

  useEffect(() => {
    if (!settings) return;
    setName(settings.name);
    setAddress(settings.address ?? "");
    setPhone(settings.phone ?? "");
    setWhatsapp(settings.whatsapp ?? "");
    setEmail(settings.email ?? "");
    setLicenseNumber(settings.licenseNumber ?? "");
  }, [settings]);

  async function handleSave() {
    if (!name.trim()) {
      setSaveError("Pharmacy name is required.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await updateSettings({
        name: name.trim(),
        address: address.trim() || null,
        phone: phone.trim() || null,
        whatsapp: whatsapp.trim() || null,
        email: email.trim() || null,
        licenseNumber: licenseNumber.trim() || null,
      });
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your pharmacy&apos;s details</p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading settings...</p>}

      {!loading && error && (
        <div className="space-y-3">
          <p className="text-sm text-red-500">Couldn&apos;t load settings: {error}</p>
          <Button variant="outline" onClick={refetch}>Retry</Button>
        </div>
      )}

      {!loading && !error && (
        <div className="max-w-xl rounded-xl border bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Store className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-semibold">Pharmacy Details</h2>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            These details are printed on every sale invoice, used in exported reports, and shown across the app.
          </p>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pharmacyName">Pharmacy name</Label>
              <Input
                ref={registerRef(0)}
                id="pharmacyName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown(0)}
                placeholder="e.g. HPK Pharmacy & Laboratory"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pharmacyAddress">Address</Label>
              <Textarea
                id="pharmacyAddress"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. No: 119/A/C1, Yagodamulla, Kotugoda"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pharmacyPhone">Phone</Label>
                <Input
                  ref={registerRef(1)}
                  id="pharmacyPhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={handleKeyDown(1)}
                  placeholder="e.g. 0786700023"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pharmacyWhatsapp">WhatsApp</Label>
                <Input
                  ref={registerRef(2)}
                  id="pharmacyWhatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  onKeyDown={handleKeyDown(2)}
                  placeholder="e.g. 0786700023"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pharmacyEmail">Email</Label>
                <Input
                  ref={registerRef(3)}
                  id="pharmacyEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown(3)}
                  placeholder="e.g. info@pharmacy.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pharmacyLicense">Tax ID / License number</Label>
                <Input
                  ref={registerRef(4)}
                  id="pharmacyLicense"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  onKeyDown={handleKeyDown(4)}
                  placeholder="e.g. PH-123456789"
                />
              </div>
            </div>
          </div>

          {saveError && <p className="mt-3 text-sm text-red-500">{saveError}</p>}
          {saved && !saveError && <p className="mt-3 text-sm text-green-600">Settings saved.</p>}

          <Button
            ref={registerRef(5)}
            onClick={handleSave}
            onKeyDown={handleKeyDown(5)}
            disabled={saving}
            className="mt-4"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
