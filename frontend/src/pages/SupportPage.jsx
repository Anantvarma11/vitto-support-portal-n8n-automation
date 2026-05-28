import { useMemo, useState } from 'react'
import { CheckCircle2, Lock, Mail, MapPin, Phone, Send, Shield } from 'lucide-react'
import { createSupportTicket } from '../lib/supportTicketApi.js'
import vittoLogo from '../assets/vitto-logo.png'

const OFFICE_ADDRESS =
  '808, Devika Tower, Nehru Place, Nehru Place, New Delhi, South East Delhi, 110019'
const MOBILE = '+91 8595215061'
const EMAIL = 'info@vitto.money'

function classNames(...xs) {
  return xs.filter(Boolean).join(' ')
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="text-accent-600"> *</span> : null}
      </span>
      {children}
    </label>
  )
}

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [ticketMeta, setTicketMeta] = useState(null)
  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    query: '',
  })

  const canSubmit = useMemo(() => {
    const mobileOk = String(form.mobile || '').replace(/\D/g, '').length >= 10
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.email || '').trim())
    return (
      String(form.fullName || '').trim().length >= 2 &&
      mobileOk &&
      emailOk &&
      String(form.query || '').trim().length >= 5
    )
  }, [form])

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit || isSubmitting) return

    setIsSubmitting(true)
    setSubmitted(false)
    setSubmitError('')
    setTicketMeta(null)
    try {
      const name = String(form.fullName || '').trim()
      const email = String(form.email || '').trim()
      const subject = 'Support Query'
      const message = [
        `Mobile: ${String(form.mobile || '').trim()}`,
        '',
        String(form.query || '').trim(),
      ].join('\n')

      const data = await createSupportTicket({ name, email, subject, message })
      setSubmitted(true)
      setTicketMeta(data)
      setForm({ fullName: '', mobile: '', email: '', query: '' })
    } catch (err) {
      setSubmitError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="https://www.vitto.money/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-soft ring-1 ring-slate-200">
              <img src={vittoLogo} alt="Vitto" className="h-7 w-auto" />
            </div>
            <div className="leading-tight">
              <div className="text-base font-extrabold tracking-tight text-slate-900">
                Vitto Money
              </div>
              <div className="text-xs font-medium text-slate-500">Let’s Talk</div>
            </div>
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            <a
              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
              href="https://www.vitto.money/business-loans"
            >
              Business Loans
            </a>
            <a
              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
              href="https://www.vitto.money/loan-eligibility-checker"
            >
              Eligibility Checker
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-slate-800"
              href="#support-form"
            >
              <Send className="h-4 w-4" />
              Let’s Talk
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-accent-50 via-white to-white">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-accent-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />

          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:py-20">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                <Shield className="h-4 w-4 text-brand-600" />
                Your data is encrypted
              </div>

              <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Get in Touch with <span className="text-brand-700">Vitto Money</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                Fill the contact us form and our support team will reach you in minutes.
              </p>

              <ul className="mt-8 space-y-3 text-sm text-slate-700">
                {[
                  'Instantly get the loan by filling out the form. Our executive will contact you in minutes.',
                  'We have a dedicated team of 30+ members which guarantees full customer satisfaction.',
                  'Need an instant business loan? Contact Vitto Money for quick approval, an easy EMI option and minimal paperwork.',
                  'We ensure the integrity and security of our customers. All your data is encrypted with a 64-bit advanced encryption system.',
                  'Vitto Money ensures business loan approval in a few days with our Android & Web applications.',
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-accent-600" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Phone className="h-4 w-4 text-brand-600" />
                    Mobile
                  </div>
                  <div className="mt-2 text-sm font-bold text-slate-900">{MOBILE}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Mail className="h-4 w-4 text-brand-600" />
                    Email
                  </div>
                  <div className="mt-2 text-sm font-bold text-slate-900">{EMAIL}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Lock className="h-4 w-4 text-brand-600" />
                    Security
                  </div>
                  <div className="mt-2 text-sm font-bold text-slate-900">64-bit encryption</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div
                id="support-form"
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                      Send Your Query
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">Enter the below details:</p>
                  </div>
                  {submitted ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Submitted
                    </div>
                  ) : null}
                </div>

                <form className="mt-6 space-y-5" onSubmit={onSubmit}>
                  {submitError ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
                      {submitError}
                    </div>
                  ) : null}

                  {submitted && ticketMeta?.ticketId ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                      <div className="font-extrabold">Ticket received</div>
                      <div className="mt-1 text-xs text-emerald-800">
                        Ticket ID: <span className="font-mono font-bold">{ticketMeta.ticketId}</span>
                      </div>
                    </div>
                  ) : null}

                  <Field label="Full Name" required>
                    <input
                      value={form.fullName}
                      onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                      placeholder="Enter Full Name (As Per PAN Card)"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                      autoComplete="name"
                      required
                    />
                  </Field>

                  <Field label="Mobile No." required>
                    <input
                      value={form.mobile}
                      onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
                      placeholder="Enter Mobile No."
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                      inputMode="numeric"
                      autoComplete="tel"
                      required
                    />
                  </Field>

                  <Field label="Email Address" required>
                    <input
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="Enter Email Address"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </Field>

                  <Field label="Query" required>
                    <textarea
                      value={form.query}
                      onChange={(e) => setForm((p) => ({ ...p, query: e.target.value }))}
                      placeholder="Enter your query..."
                      className="min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                      required
                    />
                  </Field>

                  <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className={classNames(
                      'mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold shadow-soft transition',
                      !canSubmit || isSubmitting
                        ? 'pointer-events-none bg-slate-200 text-slate-500 opacity-80'
                        : 'bg-slate-900 text-white hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200',
                    )}
                  >
                    {isSubmitting ? 'Sending…' : 'Send Your Query'}
                    <Send className="h-4 w-4" />
                  </button>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <Shield className="mt-0.5 h-4 w-4 flex-none text-brand-700" />
                      <p>
                        We respect your privacy. By submitting, you agree to be contacted by our team.
                      </p>
                    </div>
                  </div>
                </form>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <MapPin className="h-5 w-5 text-accent-600" />
                    Office Address
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{OFFICE_ADDRESS}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <Phone className="h-5 w-5 text-accent-600" />
                    Contact
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold">{MOBILE}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold">{EMAIL}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold">Secure submission</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600 sm:px-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="font-extrabold text-slate-900">Vitto Money</div>
                <div className="text-xs">{OFFICE_ADDRESS}</div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                  href="https://www.vitto.money/privacy"
                >
                  Privacy Policy
                </a>
                <a
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                  href="https://www.vitto.money/terms-and-conditions"
                >
                  Terms & Conditions
                </a>
              </div>
            </div>

            <div className="mt-8 text-xs text-slate-500">
              Copyright © {new Date().getFullYear()} Vitto Money. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

