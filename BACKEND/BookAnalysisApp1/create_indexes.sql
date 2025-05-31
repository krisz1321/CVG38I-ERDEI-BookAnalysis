-- Add index for BookId and Frequency columns
CREATE INDEX IF NOT EXISTS IX_BookPhrases_BookId_Frequency ON BookPhrases (BookId, Frequency);
