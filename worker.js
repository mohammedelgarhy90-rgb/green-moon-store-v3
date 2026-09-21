REPLACE THE BROKEN GREEN MOON DOCTOR RETURN BLOCK

Find this entire broken block:

        return json({
          success:
            true,

          const extractedText =
  data.output_text ||
  (Array.isArray(data.output)
    ? data.output
        .flatMap(item =>
          Array.isArray(item?.content)
            ? item.content
            : []
        )
        .filter(part =>
          part?.type === 'output_text' &&
          typeof part?.text === 'string'
        )
        .map(part => part.text)
        .join('\n')
    : '') ||
  '';

if (!extractedText.trim()) {
  return json(
    {
      error:
        'محرك التحليل استقبل الصورة لكنه لم يُرجع نصًا قابلًا للعرض.'
    },
    502
  );
}

return json({
  success:
    true,

  result:
    extractedText.trim()
});
        });

Replace it with exactly:

        const extractedText =
          data.output_text ||
          (Array.isArray(data.output)
            ? data.output
                .flatMap(item =>
                  Array.isArray(item?.content)
                    ? item.content
                    : []
                )
                .filter(part =>
                  part?.type === 'output_text' &&
                  typeof part?.text === 'string'
                )
                .map(part => part.text)
                .join('\n')
            : '') ||
          '';

        if (!extractedText.trim()) {
          return json(
            {
              error:
                'محرك التحليل استقبل الصورة لكنه لم يُرجع نصًا قابلًا للعرض.'
            },
            502
          );
        }

        return json({
          success:
            true,
          result:
            extractedText.trim()
        });
