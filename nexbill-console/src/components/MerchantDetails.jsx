import React from 'react';
import { Building, Globe, MapPin, Landmark, FileText, Check, ExternalLink } from 'lucide-react';

function Field({ label, value, mono = false, className = '' }) {
  return (
    <div className={className}>
      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-0.5 font-medium">{label}</span>
      <span className={`text-[12.5px] font-semibold text-zinc-800 dark:text-zinc-200 ${mono ? 'font-mono uppercase' : ''}`}>
        {value || 'N/A'}
      </span>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 mb-3">
        <Icon className="w-3.5 h-3.5 text-indigo-500" /> {title}
      </h4>
      <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/60 transition-colors">
        {children}
      </div>
    </div>
  );
}

export default function MerchantDetails({ merchant }) {
  if (!merchant) return null;

  const address = [
    merchant.business_address_line1,
    merchant.business_address_line2,
    merchant.business_address_city,
    merchant.business_address_state,
    merchant.business_address_postal
  ].filter(Boolean).join(', ');

  return (
    <div className="space-y-5">

      {/* Merchant Identity Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0">
          {(merchant.company || merchant.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold text-zinc-900 dark:text-white truncate">
            {merchant.legal_name || merchant.company || 'Unnamed Business'}
          </h3>
          <p className="text-[12px] text-zinc-400 dark:text-zinc-500 truncate">
            {merchant.email} · ID: {merchant.id}
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide ${
          merchant.verification_status === 'verified'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
            : merchant.verification_status === 'action_required'
            ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
            : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
        }`}>
          {merchant.verification_status || 'pending'}
        </span>
      </div>

      {/* Legal Business Info */}
      <Section icon={Building} title="Legal Business Info">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Field label="Legal Name" value={merchant.legal_name || merchant.company} />
          <Field label="DBA / Brand Name" value={merchant.doing_business_as} />
          <Field label="Business Type" value={merchant.business_entity_type} />
          <Field label="Industry" value={merchant.industry} />
          <Field label="Business PAN" value={merchant.business_pan} mono />
          <Field label="GSTIN" value={merchant.gstin} mono />
          {merchant.reg_number && (
            <Field label="CIN / Registration" value={merchant.reg_number} mono className="col-span-2" />
          )}
        </div>
      </Section>

      {/* Online Presence */}
      <Section icon={Globe} title="Online Presence & Compliance">
        <div className="space-y-2.5 text-[12px]">
          {[
            { label: 'Website URL', value: merchant.website_url },
            { label: 'Terms & Conditions', value: merchant.tc_url },
            { label: 'Refund Policy', value: merchant.refund_url },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-zinc-400 dark:text-zinc-500">{item.label}</span>
              {item.value ? (
                <a href={item.value} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1 truncate max-w-[220px]">
                  {item.value} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              ) : (
                <span className="text-zinc-300 dark:text-zinc-700">Not provided</span>
              )}
            </div>
          ))}
          <div className="pt-2.5 border-t border-zinc-50 dark:border-zinc-800/50">
            <Field label="Statement Descriptor" value={merchant.statement_descriptor} mono />
          </div>
        </div>
      </Section>

      {/* Representative */}
      <Section icon={MapPin} title="Representative Details">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Field label="Name" value={merchant.rep_name || merchant.name} />
          <Field label="Title" value={merchant.rep_title || 'Owner/Executive'} />
          <Field label="Date of Birth" value={merchant.rep_dob} />
          <Field label="PAN" value={merchant.rep_pan} mono />
          <Field label="Aadhaar (last 4)" value={merchant.rep_aadhaar} mono />
          <Field label="International Payments" value={
            merchant.accept_international === true || merchant.accept_international === 'true' ? 'Accepted' : 'No'
          } />
          {address && (
            <div className="col-span-2 pt-2.5 border-t border-zinc-50 dark:border-zinc-800/50">
              <Field label="Registered Office Address" value={address} />
            </div>
          )}
        </div>
      </Section>

      {/* Bank Details */}
      <Section icon={Landmark} title="Payout Bank Details">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Field label="Account Holder" value={merchant.account_name} className="col-span-2" />
          <Field label="Account Number" value={merchant.account_number || '••••••••••••'} mono />
          <Field label="IFSC Code" value={merchant.ifsc} mono />
        </div>
      </Section>

      {/* Documents */}
      <Section icon={FileText} title="Uploaded Documents">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'PAN Document', url: merchant.pan_doc_url },
            { label: 'Business Proof', url: merchant.business_proof_url },
          ].map(doc => (
            <div key={doc.label} className="border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/30 rounded-lg p-3 text-center min-h-[80px] flex flex-col justify-between">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase">{doc.label}</span>
              {doc.url ? (
                <>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" /> Uploaded
                  </div>
                  <a
                    href={`http://localhost:7123${doc.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 hover:underline"
                  >
                    View Document
                  </a>
                </>
              ) : (
                <div className="text-[11px] text-zinc-300 dark:text-zinc-600 mt-3">Not uploaded</div>
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
