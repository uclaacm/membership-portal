"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/Internship/ProtectedRoute";
import CommitteeForm from "@/components/Internship/CommitteeForm";
import ConfirmationModal from "@/components/Modal/confirmationModal";
import fetchCommitteeById from "@/app/actions/internship/fetchCommitteeById";
import updateCommittee from "@/app/actions/internship/updateCommittee";
import deleteCommittee from "@/app/actions/internship/deleteCommittee";
import "@/components/Internship/AdminDashboard.scss";

export default function EditCommitteePage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [committee, setCommittee] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [dangerError, setDangerError] = useState(null);
  const [dangerPending, setDangerPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchCommitteeById(id);
      if (cancelled) return;
      if (result.success) {
        setCommittee(result.data);
      } else {
        setLoadError(result.error);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(payload) {
    const result = await updateCommittee(id, payload);
    if (result.success) {
      setCommittee(result.data);
    }
    return result;
  }

  async function handleConfirmDelete() {
    setConfirmDelete(false);
    setDangerPending(true);
    setDangerError(null);

    const result = await deleteCommittee(id);
    setDangerPending(false);
    if (!result.success) {
      setDangerError(result.error);
      return;
    }
    router.push("/internship/admin");
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="admin-dashboard">
        <h2>Edit Committee</h2>

        {loading && <div className="admin-dashboard__placeholder">Loading committee…</div>}
        {!loading && loadError && (
          <div className="committee-table-wrapper__error">{loadError}</div>
        )}

        {!loading && committee && (
          <>
            <CommitteeForm
              initialValues={committee}
              submitLabel="Save Changes"
              onSubmit={handleSubmit}
            />

            <div className="committee-form__danger-zone">
              <h3>Danger Zone</h3>
              {dangerError && <div className="committee-form__error">{dangerError}</div>}
              <div className="committee-form__danger-actions">
                <div className="committee-form__danger-row">
                  <div>
                    <strong>Delete committee</strong>
                    <p>
                      Permanently deletes the committee. This cannot be undone. Any application
                      with this committee will have the committee choice, responses, status, and officer review removed from it.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="committee-form__danger-btn committee-form__danger-btn--delete"
                    disabled={dangerPending}
                    onClick={() => setConfirmDelete(true)}
                  >
                    Delete Committee
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <ConfirmationModal
          opened={confirmDelete}
          title="Permanently delete this committee?"
          message="This permanently deletes the committee and cannot be undone. Any application with no other committee choice will be deleted entirely, and this committee's choice, responses, status, and officer review will be removed from any application that also chose a different committee."
          submit={handleConfirmDelete}
          cancel={() => setConfirmDelete(false)}
        />
      </div>
    </ProtectedRoute>
  );
}
