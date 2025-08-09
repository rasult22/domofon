require 'jwt'
require 'openssl'

# PEM certificate path
PEM_PATH = "./voip_cert.pem"

# Apple Developer information
TEAM_ID = "DGUNQP88RJ"
KEY_ID = "VOIP_KEY_ID"
CLIENT_ID = "com.rasult22.domofon"

# Read the private key from PEM file
private_key = OpenSSL::PKey::EC.new(File.read(PEM_PATH))

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

puts "Generated VoIP JWT Token:"
puts jwt_token
puts "\nToken length: #{jwt_token.length}"
puts "Expires at: #{Time.at(payload['exp'])}"