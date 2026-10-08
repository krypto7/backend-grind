"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ImagePlusIcon } from "lucide-react";
import { AccountAvatar } from "@/components/app/account-avatar";
import { Field, authInputClass } from "@/components/auth/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { isEmail, isUsername } from "@/lib/auth-form";
import { editProfileAPI, type AccountUser } from "@/lib/api";

type EditErrors = {
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
};

export function EditProfileDialog({
  user,
  open,
  onOpenChange,
  onSaved,
}: {
  user: AccountUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (user: AccountUser) => void;
}) {
  const [firstname, setFirstname] = useState(user.firstname);
  const [lastname, setLastname] = useState(user.lastname);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const [errors, setErrors] = useState<EditErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFirstname(user.firstname);
    setLastname(user.lastname);
    setUsername(user.username);
    setEmail(user.email);
    setPhoto(null);
    setErrors({});
    setSubmitError("");
    setSaving(false);
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setPreview(null);
  }, [open, user]);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  function onPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const nextPreview = file ? URL.createObjectURL(file) : null;
    previewRef.current = nextPreview;
    setPhoto(file);
    setPreview(nextPreview);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: EditErrors = {};

    if (!firstname.trim()) nextErrors.firstname = "Enter your first name.";
    if (!lastname.trim()) nextErrors.lastname = "Enter your last name.";

    if (!username.trim()) {
      nextErrors.username = "Choose a username.";
    } else if (!isUsername(username)) {
      nextErrors.username = "Use 3–20 letters, numbers, or underscores.";
    }

    if (!email.trim()) {
      nextErrors.email = "Enter your email.";
    } else if (!isEmail(email)) {
      nextErrors.email = "Enter a valid email.";
    }

    setErrors(nextErrors);
    setSubmitError("");
    if (Object.keys(nextErrors).length > 0) return;

    const payload = new FormData();
    payload.append("firstname", firstname.trim());
    payload.append("lastname", lastname.trim());
    payload.append("username", username.trim());
    payload.append("email", email.trim());
    if (photo) payload.append("avtar", photo);

    setSaving(true);
    try {
      const data = await editProfileAPI(payload);
      onSaved(data.user);
      setSaving(false);
      onOpenChange(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to update your profile.",
      );
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} disablePointerDismissal={saving}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-[#14241f]/40" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[min(100dvh-2rem,40rem)] w-[min(100%-2rem,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-background p-6 shadow-lg ring-1 ring-foreground/10 sm:p-8">
          <Dialog.Title className="font-serif text-3xl tracking-tight">
            Edit profile
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
            Update the details shown on your account.
          </Dialog.Description>

          <form onSubmit={onSubmit} className="mt-6 grid gap-5" noValidate>
            <div className="flex items-center gap-4">
              {preview ? (
                // Local preview of a file just chosen in this dialog.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt=""
                  className="size-16 rounded-full object-cover ring-2 ring-foreground/10"
                />
              ) : (
                <AccountAvatar user={user} className="size-16 text-lg" />
              )}
              <label
                htmlFor="edit-avtar"
                className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium"
              >
                <ImagePlusIcon className="size-4" />
                {photo ? photo.name : "Change photo"}
                <input
                  id="edit-avtar"
                  name="avtar"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={onPhotoChange}
                />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name" htmlFor="edit-firstname" error={errors.firstname}>
                <Input
                  id="edit-firstname"
                  name="firstname"
                  autoComplete="given-name"
                  value={firstname}
                  onChange={(event) => setFirstname(event.target.value)}
                  aria-invalid={Boolean(errors.firstname)}
                  className={authInputClass}
                />
              </Field>
              <Field label="Last name" htmlFor="edit-lastname" error={errors.lastname}>
                <Input
                  id="edit-lastname"
                  name="lastname"
                  autoComplete="family-name"
                  value={lastname}
                  onChange={(event) => setLastname(event.target.value)}
                  aria-invalid={Boolean(errors.lastname)}
                  className={authInputClass}
                />
              </Field>
            </div>

            <Field label="Username" htmlFor="edit-username" error={errors.username}>
              <Input
                id="edit-username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                aria-invalid={Boolean(errors.username)}
                className={authInputClass}
              />
            </Field>

            <Field label="Email" htmlFor="edit-email" error={errors.email}>
              <Input
                id="edit-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(errors.email)}
                className={authInputClass}
              />
            </Field>

            {submitError ? (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            ) : null}

            <div className="flex justify-end gap-2">
              <Dialog.Close
                type="button"
                className="inline-flex h-11 items-center rounded-lg px-4 text-sm font-medium hover:bg-muted"
                disabled={saving}
              >
                Cancel
              </Dialog.Close>
              <Button type="submit" className="h-11 px-4" disabled={saving} aria-busy={saving}>
                {saving ? <Spinner /> : null}
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
