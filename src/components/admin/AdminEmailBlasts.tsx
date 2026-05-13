import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Send, Mail, Eye, Clock, Users as UsersIcon } from "lucide-react";

interface Blast {
  id: string;
  subject: string;
  sent_at: string;
  total_recipients: number;
  triggered_by: string;
}

interface Recipient {
  id: string;
  email: string;
  sent_at: string | null;
  opened_at: string | null;
  open_count: number;
  send_status: string;
}

export function AdminEmailBlasts() {
  const { toast } = useToast();
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [selected, setSelected] = useState<Blast | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [connectedCount, setConnectedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadBlasts = async () => {
    const [{ data: bs }, { count: cc }] = await Promise.all([
      supabase.from("email_blasts").select("*").order("sent_at", { ascending: false }).limit(50),
      supabase.from("connections").select("*", { count: "exact", head: true }),
    ]);
    setBlasts((bs as Blast[]) || []);
    setConnectedCount(cc || 0);
    setLoading(false);
  };

  useEffect(() => {
    loadBlasts();
  }, []);

  const loadRecipients = async (b: Blast) => {
    setSelected(b);
    const { data } = await supabase
      .from("email_blast_recipients")
      .select("id, email, sent_at, opened_at, open_count, send_status")
      .eq("blast_id", b.id)
      .order("opened_at", { ascending: false, nullsFirst: false });
    setRecipients((data as Recipient[]) || []);
  };

  const triggerBlast = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-bulk-blast", {
        body: { triggeredBy: "manual" },
      });
      if (error) throw error;
      toast({ title: "Blast queued", description: `Sent: ${data?.totalSent ?? 0}, Failed: ${data?.totalFailed ?? 0}` });
      await loadBlasts();
    } catch (e: any) {
      toast({ title: "Failed to send blast", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const openedCount = recipients.filter((r) => r.opened_at).length;
  const openRate = recipients.length ? Math.round((openedCount / recipients.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bulk Emails</h2>
          <p className="text-muted-foreground">Auto-sent every 2 hours. Track opens per recipient.</p>
        </div>
        <Button onClick={triggerBlast} disabled={sending}>
          <Send className="h-4 w-4 mr-2" />
          {sending ? "Sending..." : "Send Now"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><UsersIcon className="h-4 w-4" />Total Connections</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{connectedCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Mail className="h-4 w-4" />Total Blasts</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{blasts.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" />Schedule</CardTitle></CardHeader>
          <CardContent><div className="text-lg font-semibold">Every 2 hours</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Blasts</CardTitle>
          <CardDescription>Click a row to see who opened the email.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : blasts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No blasts sent yet. The cron runs every 2 hours, or click Send Now.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blasts.map((b) => (
                  <TableRow key={b.id} className="cursor-pointer" onClick={() => loadRecipients(b)}>
                    <TableCell>{new Date(b.sent_at).toLocaleString()}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{b.subject}</TableCell>
                    <TableCell>{b.total_recipients}</TableCell>
                    <TableCell><Badge variant="outline">{b.triggered_by}</Badge></TableCell>
                    <TableCell><Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>Recipients — {selected.subject}</CardTitle>
            <CardDescription>
              {openedCount} / {recipients.length} opened ({openRate}%)
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Opened?</TableHead>
                  <TableHead>Opened At</TableHead>
                  <TableHead>Opens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipients.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.email}</TableCell>
                    <TableCell>
                      <Badge variant={r.send_status === "sent" ? "default" : r.send_status === "failed" ? "destructive" : "secondary"}>
                        {r.send_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.opened_at ? (
                        <Badge className="bg-green-600 hover:bg-green-600">Opened</Badge>
                      ) : (
                        <Badge variant="secondary">Not opened</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{r.opened_at ? new Date(r.opened_at).toLocaleString() : "—"}</TableCell>
                    <TableCell>{r.open_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
