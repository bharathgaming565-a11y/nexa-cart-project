$prod = Invoke-RestMethod 'http://localhost:8000/api/v1/products'
$first = $prod.products[0]
$id = $first._id
$single = @{ product = @{ _id = $id; price = $first.price; name = $first.name }; qty = 1 }
$payload = @{ cartItems = @($single); customer = @{ name='Test User'; phone='9999999999'; address='123 Test St'}; paymentMethod='cod'; paymentDetails=@{} }
$json = $payload | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri 'http://localhost:8000/api/v1/order' -Method Post -Body $json -ContentType 'application/json' | ConvertTo-Json -Depth 10 | Out-File -FilePath place_test_order_result.json -Encoding utf8
Write-Output 'ORDER_DONE'