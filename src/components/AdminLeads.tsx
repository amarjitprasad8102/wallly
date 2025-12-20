import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, MessageCircle, Crown, Mail, Phone, Clock, CheckCircle, XCircle, ArrowLeft, User, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  lead_type: string;
  plan_interest: string | null;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
}

interface LeadMessage {
  id: string;
  lead_id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

interface AdminLeadsProps {
  adminId: string;
}

const AdminLeads = ({ adminId }: AdminLeadsProps) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<LeadMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLeads();
  }, [filter]);

  useEffect(() => {
    if (selectedLead) {
      fetchMessages(selectedLead.id);
      
      // Subscribe to new messages
      const channel = supabase
        .channel(`lead-messages-${selectedLead.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'lead_messages',
          filter: `lead_id=eq.${selectedLead.id}`,
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as LeadMessage]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedLead?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchLeads = async () => {
    setLoading(true);
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      if (filter === 'premium' || filter === 'contact' || filter === 'priority_contact') {
        query = query.eq('lead_type', filter);
      } else if (filter === 'priority') {
        query = query.eq('status', filter);
      } else {
        query = query.eq('status', filter);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  const fetchMessages = async (leadId: string) => {
    const { data, error } = await supabase
      .from('lead_messages')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', leadId);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Status updated to ${status}`);
      fetchLeads();
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, status } : null);
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedLead) return;

    setSending(true);
    const { error } = await supabase.from('lead_messages').insert({
      lead_id: selectedLead.id,
      sender_type: 'admin',
      sender_id: adminId,
      message: newMessage.trim(),
    });

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } else {
      setNewMessage('');
      // Update lead status to in_progress if it was new
      if (selectedLead.status === 'new') {
        updateLeadStatus(selectedLead.id, 'in_progress');
      }
    }
    setSending(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500">New</Badge>;
      case 'priority':
        return <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"><Zap className="w-3 h-3 mr-1" />Priority</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case 'converted':
        return <Badge className="bg-green-500">Converted</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string, planInterest?: string | null) => {
    if (type === 'premium') {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <Crown className="w-3 h-3 mr-1" />
          {planInterest ? planInterest.charAt(0).toUpperCase() + planInterest.slice(1) : 'Premium'}
        </Badge>
      );
    }
    if (type === 'priority_contact') {
      return (
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Zap className="w-3 h-3 mr-1" />
          Priority Support
        </Badge>
      );
    }
    return <Badge variant="outline">Contact</Badge>;
  };

  if (selectedLead) {
    return (
      <div className="flex flex-col h-[600px]">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => setSelectedLead(null)}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{selectedLead.name}</h3>
              {getTypeBadge(selectedLead.lead_type, selectedLead.plan_interest)}
              {getStatusBadge(selectedLead.status)}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {selectedLead.email}
              </span>
              {selectedLead.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {selectedLead.phone}
                </span>
              )}
            </div>
          </div>
          <Select value={selectedLead.status} onValueChange={(value) => updateLeadStatus(selectedLead.id, value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Original Message */}
        <div className="p-4 bg-muted/50 border-b">
          <p className="text-sm font-medium mb-1">{selectedLead.subject || 'Initial Message'}</p>
          <p className="text-sm text-muted-foreground">{selectedLead.message}</p>
          <p className="text-xs text-muted-foreground mt-2">
            <Clock className="w-3 h-3 inline mr-1" />
            {format(new Date(selectedLead.created_at), 'PPp')}
          </p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.sender_type === 'admin'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {format(new Date(msg.created_at), 'p')}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your reply..."
              disabled={sending}
            />
            <Button type="submit" disabled={sending || !newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Messages are stored in the database. For email communication, use the Email tab.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter leads" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leads</SelectItem>
            <SelectItem value="premium">Premium Inquiries</SelectItem>
            <SelectItem value="priority_contact">Priority Support</SelectItem>
            <SelectItem value="contact">Contact Forms</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="priority">Priority Status</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchLeads}>
          Refresh
        </Button>
        <div className="text-sm text-muted-foreground">
          {leads.length} lead{leads.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No leads found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {leads.map((lead) => (
            <Card
              key={lead.id}
              className={`cursor-pointer transition-colors ${
                lead.status === 'priority' || lead.lead_type === 'priority_contact' 
                  ? 'border-amber-500/50 bg-gradient-to-r from-amber-500/5 to-orange-500/5 hover:border-amber-500' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedLead(lead)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{lead.name}</h4>
                      {getTypeBadge(lead.lead_type, lead.plan_interest)}
                      {getStatusBadge(lead.status)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{lead.email}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {lead.subject ? `${lead.subject}: ` : ''}{lead.message}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(lead.created_at), 'MMM d, p')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLeads;