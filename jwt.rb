require 'jwt'
require 'openssl'

# Your Apple Developer information
TEAM_ID = "DGUNQP88RJ"           # 10-character Team ID from Apple Developer
KEY_ID = "9P4JZ87787"             # 10-character Key ID from the p8 file name
CLIENT_ID = "com.rasult22.domofon"  # Your Service ID (Bundle ID)

# Path to your p8 private key file
PRIVATE_KEY_PATH = "./AuthKey_9P4JZ87787.p8"

# Read the private key
private_key = OpenSSL::PKey::EC.new(File.read(PRIVATE_KEY_PATH))

# JWT Header
header = {
  'alg' => 'ES256',
  'kid' => KEY_ID
}

# JWT Payload
now = Time.now.to_i
payload = {
  'iss' => TEAM_ID,
  'iat' => now,
  'exp' => now + (6 * 30 * 24 * 60 * 60), # 6 months from now
  'aud' => 'https://appleid.apple.com',
  'sub' => CLIENT_ID
}

# Generate JWT
jwt_token = JWT.encode(payload, private_key, 'ES256', header)

puts "Generated JWT Token:"
puts jwt_token
puts "\nToken length: #{jwt_token.length}"
puts "Expires at: #{Time.at(payload['exp'])}"