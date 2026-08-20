import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { supportApi } from '../api/api';
import { SupportStatus, SupportTicket } from '../types';
import Wrapper from '../components/Wrapper';

const STATUS_STYLES: Record<SupportStatus, string> = {
  open: 'bg-amber-100 text-amber-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  resolved: 'bg-cyan-100 text-cyan-700',
};

const STATUS_LABELS: Record<SupportStatus, string> = {
  open: 'Open',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
};

const TYPE_LABELS: Record<string, string> = {
  bug: 'Bug',
  feature: 'Feature Request',
  other: 'Other',
};

const attachmentUrl = (path: string) => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  if (apiUrl.startsWith('http')) return new URL(apiUrl).origin + path;
  return path;
};

const MyReports: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supportApi
      .getMine()
      .then((res) => {
        if (res.data.success) setTickets(res.data.data);
      })
      .catch((err) => console.error('Failed to fetch reports:', err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return '—';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <Wrapper>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Reports</h1>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-cyan-600 text-white hover:bg-cyan-700"
          >
            <MessageSquare className="w-4 h-4" />
            Report a problem
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-1">You haven't submitted any reports yet.</p>
            <p className="text-sm text-gray-400">
              Use the "Help" button at the bottom-right to report a problem.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {TYPE_LABELS[t.type] || t.type}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[t.status]}`}>
                        {STATUS_LABELS[t.status]}
                      </span>
                    </div>
                    <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">{t.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{t.message}</p>
                    {t.attachment && (
                      <a
                        href={attachmentUrl(t.attachment)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm text-cyan-600 hover:underline"
                      >
                        View attachment
                      </a>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{formatDate(t.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Wrapper>
    </div>
  );
};

export default MyReports;