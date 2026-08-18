import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, X, Paperclip, Send, CheckCircle2 } from 'lucide-react';
import { supportApi } from '../../api/api';
import { SupportType } from '../../types';

const ReportButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<SupportType>('bug');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const reset = () => {
    setType('bug');
    setTitle('');
    setMessage('');
    setAttachment(null);
    setError('');
    setDone(false);
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError('Please fill in the title and description.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('type', type);
      fd.append('title', title);
      fd.append('message', message);
      if (attachment) fd.append('attachment', attachment);
      await supportApi.create(fd);
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Report a problem"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-colors"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="hidden sm:inline text-sm font-medium">Help</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-xl sm:rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {done ? 'Report Submitted' : 'Report a Problem'}
              </h3>
              <button
                type="button"
                onClick={close}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {done ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-gray-700 mb-1">Thank you! Your report has been sent to our team.</p>
                <p className="text-sm text-gray-500 mb-5">You can track its status from My Reports.</p>
                <div className="flex items-center justify-center gap-2">
                  <Link
                    to="/my-reports"
                    onClick={close}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    My Reports
                  </Link>
                  <button
                    type="button"
                    onClick={close}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Problem type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as SupportType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="bug">Bug / Something is broken</option>
                    <option value="feature">Feature request</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Short summary of the problem"
                    maxLength={255}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what happened and what you expected..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Screenshot <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 cursor-pointer hover:border-emerald-500 hover:text-emerald-600">
                      <Paperclip className="w-4 h-4" />
                      <span className="truncate">{attachment ? attachment.name : 'Attach an image'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
                        className="hidden"
                        onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                      />
                    </label>
                    {attachment && (
                      <button
                        type="button"
                        onClick={() => setAttachment(null)}
                        className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex items-center justify-between gap-2 pt-1">
                  <Link to="/my-reports" onClick={close} className="text-sm text-emerald-600 hover:underline">
                    My reports
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ReportButton;