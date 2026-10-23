<?php
// Standalone PHP test. No WordPress bootstrap, database, HTTP, order or email.
define('ABSPATH', __DIR__);
function add_action(...$args) {}
function add_filter(...$args) {}
class WC_Data_Exception extends Exception {
    private string $errorCode;
    public function __construct($code, $message, $status) { parent::__construct($message, $status); $this->errorCode=$code; }
    public function getErrorCode() { return $this->errorCode; }
}
class SyntheticProduct {
    public function __construct(private int $id) {}
    public function is_type($type) { return is_array($type) ? in_array('variation', $type, true) : $type==='variation'; }
    public function get_parent_id() { return 99; }
    public function get_id() { return $this->id; }
    public function get_status() { return 'publish'; }
    public function is_in_stock() { return $this->id!==9999; }
    public function managing_stock() { return true; }
    public function backorders_allowed() { return false; }
    public function get_stock_managed_by_id() { return 99; }
}
function wc_get_product($id) { return new SyntheticProduct((int)$id); }
require $argv[1];
function check($condition, $message) { if (!$condition) throw new RuntimeException($message); }
$items=[];
for($i=0;$i<200;$i++) $items[]=['product_id'=>99,'variation_id'=>1001+$i,'quantity'=>1];
[$products,$required]=RP_Stock_Guard::products($items);
check(count($products)===200 && $required===[99=>200], 'All 200 lines must aggregate inherited stock');
$items[]=$items[0];
try { RP_Stock_Guard::products($items); throw new RuntimeException('Accepted 201 lines'); }
catch(InvalidArgumentException $e) { check(str_contains($e->getMessage(),'200 combinaciones'),'Missing limit message'); }
try { RP_Stock_Guard::products([['product_id'=>98,'variation_id'=>1001,'quantity'=>1]]); throw new RuntimeException('Wrong parent accepted'); }
catch(InvalidArgumentException $e) {}
try { RP_Stock_Guard::products([['product_id'=>99,'variation_id'=>9999,'quantity'=>1]]); throw new RuntimeException('Sold out accepted'); }
catch(WC_Data_Exception $e) { check($e->getErrorCode()==='rp_insufficient_stock','Wrong stock error'); }
try { RP_Stock_Guard::products([['product_id'=>99,'variation_id'=>1001,'quantity'=>100]]); throw new RuntimeException('Invalid quantity accepted'); }
catch(InvalidArgumentException $e) {}
echo json_encode(['passed'=>true,'lines'=>200,'inherited_stock_aggregated'=>true,'limit_enforced'=>true,'wrong_parent_rejected'=>true,'sold_out_rejected'=>true,'quantity_limit_preserved'=>true])."\n";
