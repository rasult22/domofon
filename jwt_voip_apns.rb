require 'jwt'
require 'openssl'

# Path to your .p8 private key file
P8_KEY_PATH = "./AuthKey_9P4JZ87787.p8"  # Update this path

# Apple Developer information (from your curl command)
TEAM_ID = "DGUNQP88RJ"
KEY_ID = "9P4JZ87787"

# Read the private key from .p8 file
private_key = OpenSSL::PKey::EC.new(File.read(P8_KEY_PATH))

# JWT Header
header = {
  'alg' => 'ES256',
  'kid' => KEY_ID
}

# JWT Payload (APNs specific - minimal payload)
now = Time.now.to_i
payload = {
  'iss' => TEAM_ID,
  'exp' => now + (6 * 30 * 24 * 60 * 60), # 6 months from now
  'iat' => now
}

# Generate JWT
jwt_token = JWT.encode(payload, private_key, 'ES256', header)

puts "Generated APNs JWT Token:"
puts jwt_token
puts "\nToken length: #{jwt_token.length}"
puts "Valid for: 1 hour from generation"
puts "Generated at: #{Time.at(now)}"