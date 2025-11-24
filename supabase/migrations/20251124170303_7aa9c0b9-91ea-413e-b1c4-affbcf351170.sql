-- Add unique constraint to prevent duplicate connection requests
ALTER TABLE connection_requests 
ADD CONSTRAINT unique_connection_request 
UNIQUE (from_user_id, to_user_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_connection_requests_from_to 
ON connection_requests(from_user_id, to_user_id);