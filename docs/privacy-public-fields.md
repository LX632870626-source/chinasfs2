# Public And Private Player Fields

This project keeps the public player profile intentionally smaller than the
admin player record. The API public serializers are the privacy boundary:
public endpoints serialize players through `serializePublicPlayer`, which
delegates to `toPublicPlayer` in the shared package.

## Public Player Fields

Public endpoints may return these player fields:

- `id`
- `name`
- `ageGroup`
- `position`
- `teamName`
- `region`
- `traits`
- `bio`
- `coverUrl`
- `publicVideoUrl`
- `isFeatured`
- `featureOrder`

## Private Player Fields

Public endpoints must not return these backend-only or admin-only fields:

- `birthday`
- `heightCm`
- `weightKg`
- `dominantFoot`
- `schoolOrOrg`
- `contactName`
- `contactPhone`
- `source`
- `adminNotes`
- `publicLevel`
- `isPublished`

## Submission Visibility

User submissions are review inputs, not public records. New submissions start
with status `PENDING` and are not displayed by public endpoints.

Submitted player or event information becomes public only after an
administrator creates or updates the corresponding published `Player` or
`Event` record. Public player and event routes also require `isPublished: true`.
