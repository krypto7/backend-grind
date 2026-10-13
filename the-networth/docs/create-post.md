# Create post

This is how a post with text, photos, and videos is created in this app. Read it in order. Each step answers one question: what is in the browser right now, and what has to happen next?

The files are:

- `frontend/src/components/app/home-screen.tsx` — the composer and the feed
- `frontend/src/lib/api.ts` — `createPostAPI`
- `frontend/next.config.ts` — the `/api` rewrite and the upload size limit
- `backend/src/routes/post.routes.ts` — the route
- `backend/src/middlewares/multer.middleware.ts` — Multer
- `backend/src/controllers/post.controller.ts` — `createPost`
- `backend/src/utils/cloudinary.ts` — the real file store
- `backend/src/models/post.model.ts` — the MongoDB shape

## The problem

A post is two different kinds of data.

- Text. The caption. A string.
- Files. Photos and videos. Binary, often many megabytes.

`JSON.stringify` can send the caption. It cannot send a `File`. The browser has to send `multipart/form-data`. That format is one request with named parts: one part for the caption, and one part per file.

The backend does not keep those files on its own disk. Multer writes them to a temp folder so the controller can hand each path to Cloudinary. MongoDB stores the Cloudinary URL, not the file bytes.

## Two lists, one post

The composer keeps two arrays that always have the same length and the same order.

| State | Type | What it is |
| --- | --- | --- |
| `photos` | `File[]` | The real files. These are what `createPostAPI` uploads. |
| `previews` | `MediaPreview[]` | What you see in the strip. Images are blob URLs. Videos are a JPEG frame drawn on a canvas. |

A preview is not the upload. Removing a thumbnail has to remove the matching `File` at the same index, or the post would upload a file you already cancelled.

`MediaPreview` is:

```ts
type MediaPreview = {
  id: string;                 // only for React keys
  kind: "image" | "video";    // decides the play badge
  src: string;                // blob URL, canvas data URL, or ""
};
```

The backend allows 5 files (`upload.array("media", 5)`). The composer stops at 5 for the same reason.

## Picking files

The input is a normal file input, hidden with `sr-only`. The visible "Photo or video" label points at it with `htmlFor="post-media"`.

```tsx
<input
  id="post-media"
  name="media"
  type="file"
  accept="image/*,video/*"
  multiple
  onChange={onPhotosChange}
/>
```

Line by line:

- `type="file"` opens the system file picker.
- `accept="image/*,video/*"` is a hint to the picker. It is not a security check. The handler still filters by MIME type.
- `multiple` lets one picker session return several files.
- `onChange` runs after the user confirms the picker. It does not run when they cancel.

`onPhotosChange` appends. It does not replace what is already in the strip. That is why you can add an image, then later add a video, and both stay.

```ts
async function onPhotosChange(event) {
  const room = 5 - photos.length;
  const selected = Array.from(event.target.files ?? [])
    .filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"))
    .slice(0, Math.max(room, 0));
  event.target.value = "";
  if (selected.length === 0) return;

  const nextPreviews = [];
  for (const file of selected) {
    const id = crypto.randomUUID();
    if (isVideo(file)) {
      try {
        nextPreviews.push({ id, kind: "video", src: await captureVideoThumbnail(file) });
      } catch {
        nextPreviews.push({ id, kind: "video", src: "" });
      }
    } else {
      nextPreviews.push({ id, kind: "image", src: URL.createObjectURL(file) });
    }
  }

  setPhotos((current) => [...current, ...selected]);
  setPreviews((current) => [...current, ...nextPreviews]);
}
```

Line by line:

1. `room` is how many files are still allowed. If you already have 2, room is 3.
2. `event.target.files` is a `FileList`, which is not a real array. `Array.from` makes one so `.filter` and `.slice` work. `?? []` covers a missing list.
3. The filter keeps only image and video MIME types. A stray file is dropped.
4. `.slice(0, room)` keeps only as many new files as there is room for. `Math.max(room, 0)` avoids a negative slice when the list is already full.
5. `event.target.value = ""` clears the input. Without this, choosing the same file again does not fire `onChange`, because the value did not change.
6. An empty selection returns immediately. Nothing is revoked, nothing is replaced.
7. Each new file gets `crypto.randomUUID()` as its React key. Name plus `lastModified` can collide if the same file is added twice.
8. A video waits for `captureVideoThumbnail`. An image gets `URL.createObjectURL(file)`, a temporary `blob:` URL that points at the file already in memory. The image is not uploaded here.
9. `setPhotos` and `setPreviews` use the functional form (`current => ...`) and append. A second pick is added after the first. Both lists stay aligned: index 0 is the first file and its thumbnail, index 1 is the second, and so on.

## Video thumbnails

A `<video>` tag can play a local file, but the strip wants a still image plus a play icon. `captureVideoThumbnail` builds that still in the browser. It never leaves the page.

```ts
function captureVideoThumbnail(file: File) {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read video"));
    };

    video.onloadeddata = () => {
      const target = Number.isFinite(video.duration)
        ? Math.min(0.2, video.duration / 2)
        : 0;
      if (target > 0) {
        video.currentTime = target;
        return;
      }
      finish(drawVideoFrame(video));
    };

    video.onseeked = () => finish(drawVideoFrame(video));
  });
}
```

Line by line:

1. Another blob URL is created, this time only so a hidden `<video>` element can decode the file.
2. The element is created with `document.createElement`. It is not rendered. It only exists to decode frames.
3. `muted` and `playsInline` keep the browser from treating this as a user-facing playback.
4. `onerror` drops the blob URL and rejects. The caller then stores `src: ""`, and the strip shows a dark tile with the play icon.
5. `onloadeddata` runs when the first frame is available. It seeks to 0.2 seconds, or to the middle if the clip is shorter than that. Seeking to 0 often lands on a black frame.
6. If there is no usable duration, it draws the current frame immediately.
7. `onseeked` runs after the seek finishes, then `drawVideoFrame` paints that frame onto a 160×160 canvas and returns `canvas.toDataURL("image/jpeg", 0.8)`. That string is a data URL. It is the thumbnail. The original video `File` is still sitting in `photos`, untouched.
8. `finish` revokes the temporary video blob URL. The data URL does not need revoking. It is just a string.

`drawVideoFrame` scales the frame so it covers the square, then centers it. `Math.max(canvas / video)` is cover, not contain. If the video has no dimensions, it returns `""`.

## Removing one file

The X on a thumbnail calls `removeMedia(index)`.

```ts
function removeMedia(index: number) {
  const preview = previews[index];
  if (preview?.src.startsWith("blob:")) URL.revokeObjectURL(preview.src);
  setPhotos((current) => current.filter((_, item) => item !== index));
  setPreviews((current) => current.filter((_, item) => item !== index));
}
```

Line by line:

1. Look up the preview at that index.
2. Revoke the URL only when it starts with `blob:`. Image previews are blob URLs. Video thumbnails are `data:` URLs, and a failed video is `""`. Revoking those would be wrong. A blob URL that is never revoked stays in memory until the tab closes.
3. Filter both arrays with the same index. The files after the removed one shift together, so the lists stay paired.

Clear does the same revoke for every blob URL, then sets both arrays to `[]`.

On unmount, a separate effect revokes whatever blob URLs are still in `previewsRef`. The ref is kept in sync with state so the cleanup function sees the latest list, not the empty list from the first render.

## Sending the post

Submit reads the caption from `draft`, not from the textarea DOM.

```ts
async function onSubmit(event) {
  event.preventDefault();
  const content = draft.trim();
  if (!content || posting) return;

  setPosting(true);
  try {
    const response = await createPostAPI(content, photos);
    setPosts((current) => [response, ...current]);
    setDraft("");
    clearPhotos();
  } catch (submitError) {
    setError(submitError instanceof Error ? submitError.message : "Unable to create post.");
  } finally {
    setPosting(false);
  }
}
```

Line by line:

1. `preventDefault` stops the browser from doing a normal form navigation.
2. Empty text returns. Media is optional. Text is required. The Post button is also disabled when `draft.trim()` is empty.
3. `posting` blocks a second submit while the first request is in flight.
4. `createPostAPI(content, photos)` sends the real `File` objects. Previews are not sent.
5. The created post is placed at the front of the feed. The API returns the populated post, so the feed can render it without a second fetch.
6. Caption and files are cleared only after success.
7. `finally` always turns `posting` back off, including when the request fails.

`createPostAPI`:

```ts
export const createPostAPI = async (content: string, media: File[] = []) => {
  const formData = new FormData();
  formData.append("content", content);
  media.forEach((file) => formData.append("media", file));

  const response = await authFetch(`${baseURL}/post/create-post`, {
    method: "POST",
    body: formData,
  });
  // ...
};
```

Line by line:

1. `FormData` is the browser object that becomes `multipart/form-data`.
2. `append("content", content)` is one text part. Express puts it on `req.body.content`.
3. The loop calls `append("media", file)` once per file, with the same field name every time. That is how one field carries many files. The name `media` has to match `upload.array("media", 5)` on the route. A different name means Multer ignores the files and `req.files` is empty.
4. `authFetch` adds `credentials: "include"` so the httpOnly access cookie is sent. The route is behind `verifyJWT`.
5. There is no `Content-Type` header. The browser sets `multipart/form-data; boundary=...` itself. If you set `Content-Type: multipart/form-data` by hand, you drop the boundary and Multer cannot split the parts.

`baseURL` is `"/api"`. The browser calls `http://localhost:3000/api/post/create-post`. Next rewrites that to `http://localhost:8000/api/post/create-post`. The cookie stays on port 3000 because the browser never talks to port 8000 directly.

`experimental.proxyClientMaxBodySize` is `"100mb"`. Next's default for a proxied body is 10MB. A video larger than that was cut off, the socket reset, and the API returned 500. The whole request, caption plus every file, has to fit in 100MB.

## The route

```ts
router.route("/create-post").post(
  verifyJWT,
  upload.array("media", 5),
  postController.createPost,
);
```

Express runs these left to right.

1. `verifyJWT` reads the access cookie, checks the JWT, and sets `req.user`. If that fails, the response is 401 and Multer never runs.
2. `upload.array("media", 5)` is Multer. It reads the multipart body, writes up to 5 files, and puts them on `req.files`. The text part lands on `req.body.content`. A 6th file is rejected by Multer before the controller.
3. `createPost` runs only after both of those succeed.

The router is mounted at `/api/post` in `backend/src/app.ts`, so the full path is `POST /api/post/create-post`.

`express.json({ limit: "16kb" })` does not parse this request. That middleware only parses `Content-Type: application/json`. A multipart body skips it and is parsed by Multer.

## Multer

Multer is the middleware that turns a multipart request into files on disk plus fields on `req.body`.

```ts
const uploadDirectory = path.join(os.tmpdir(), "my-uploads");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    mkdir(uploadDirectory, { recursive: true }, (error) => {
      cb(error, uploadDirectory);
    });
  },
  filename(req, file, cb) {
    crypto.randomBytes(16, function (err, raw) {
      if (err) return cb(err, "");
      cb(null, file.fieldname + "-" + raw.toString("hex"));
    });
  },
});

export const upload = multer({ storage });
```

Line by line:

1. `os.tmpdir()` is the operating system's temp directory. `my-uploads` is a folder inside it. These files are not the permanent media. Cloudinary is.
2. `diskStorage` means "write each file to disk and give me the path." The other built-in choice, `memoryStorage`, would keep the bytes in RAM. Videos are too large for that.
3. `destination` runs once per file. `mkdir(..., { recursive: true })` creates the folder if it is missing, then `cb(error, uploadDirectory)` tells Multer where to write. The callback style is Multer's API. It does not use a returned promise.
4. `filename` runs once per file. `crypto.randomBytes(16)` makes a random 16-byte name so two uploads cannot overwrite each other. The stored name is `media-` plus that hex string. The original filename is not used.
5. `file` here is Multer's description of one part: `fieldname`, `originalname`, `mimetype`, `size`, and after the write, `path`.
6. `multer({ storage })` builds the middleware. The route calls `.array("media", 5)` on it.

After Multer, each item in `req.files` looks like this:

| Field | Meaning |
| --- | --- |
| `fieldname` | `"media"` |
| `originalname` | The name on the user's computer |
| `mimetype` | `"image/jpeg"`, `"video/mp4"`, and so on |
| `path` | The temp file Multer just wrote |
| `size` | Bytes |

`req.body.content` is the caption string. Multer parsed it from the same multipart body.

## The controller

```ts
const files = (req.files ?? []) as Express.Multer.File[];
const content = String(req.body?.content ?? "").trim();
```

`req.files` is an array because the route used `.array()`. `?? []` makes "no files" an empty list, which is a valid post. `String(...).trim()` turns a missing caption into `""`.

Then:

1. No `req.user` returns 401. `verifyJWT` should already have stopped that case.
2. An empty caption returns 400. Text is required.
3. `Promise.all(files.map(...))` uploads every temp file to Cloudinary at the same time. Each call uses `file.path`.
4. The MIME type becomes `mediaType`. `video/` is `"video"`, `audio/` is `"audio"`, anything else that reached this point is `"image"`. The frontend already filtered to image and video, so audio only appears if something else posts to this route.
5. Each item saved is `{ mediaType, mediaUrl: uploaded.secure_url, publicId: uploaded.public_id }`. `secure_url` is the HTTPS URL the feed will put in `<img>` or `<video>`. `public_id` is Cloudinary's id for that file.
6. `Post.create` writes `{ content, user: user._id, media }`. An empty `media` array is allowed.
7. `findById` plus `populate("user", "username firstname lastname avtar")` replaces the user id with those fields so the response is ready to render. The avatar field on the user model is spelled `avtar`.
8. The response is 201 and the populated post. Any thrown error, including a Cloudinary failure, is logged and returned as 500.

`if (!media)` does not reject an empty upload. `Promise.all([])` resolves to `[]`, and an empty array is truthy in JavaScript. Media stays optional.

## Cloudinary

```ts
const response = await cloudinary.uploader.upload(localFilePath, {
  resource_type: "auto",
});
await fs.promises.unlink(localFilePath);
return response;
```

`resource_type: "auto"` lets Cloudinary decide image versus video from the file. After a successful upload the temp file is deleted. On failure the `catch` deletes it too, then rethrows, which becomes the controller's 500. The temp file is not meant to survive the request.

## What is stored

```ts
{
  content: String,          // required
  user: ObjectId,           // ref User, required
  media: [{
    mediaType: "image" | "video" | "audio",
    mediaUrl: String,       // Cloudinary secure_url
    publicId: String,
    size: Number,           // unused by createPost today
  }],
  createdAt, updatedAt      // added by timestamps: true
}
```

## What the feed shows

`getPosts` returns every post, newest first, with the same user fields populated. The home screen loads that on mount.

For each post, `post.media` is rendered in order. `mediaType === "video"` becomes a `<video controls>`. Anything else with a `mediaUrl` becomes an `<img>`. The composer thumbnails are gone by then. The feed uses the Cloudinary URLs from the response.

## One request, end to end

1. You type a caption. That string lives in `draft`.
2. You pick an image. It is appended to `photos` as a `File` and to `previews` as a blob URL.
3. You pick a video. It is appended after the image. Its preview is a canvas JPEG. The image is still there.
4. You click X on one thumbnail. That index is removed from both arrays.
5. You press Post. `FormData` carries `content` once and `media` once per remaining file.
6. Next forwards the body to Express, up to 100MB.
7. `verifyJWT` sets `req.user`.
8. Multer writes each file under the temp directory and sets `req.files`.
9. The controller uploads each temp path to Cloudinary, deletes the temp file, and saves the URLs on the post.
10. The response is inserted at the top of the feed, and the composer lists are cleared.
