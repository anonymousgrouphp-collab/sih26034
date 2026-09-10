import React, { useState } from "react";
import { Modal } from "../../components/common/Modal";
import {
  CreateInspectionPayload,
  InspectionCase,
  PackagingType,
  InspectionType,
} from "../../types/inspection";
import { ApiService } from "../../services/api";

interface NewInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCircleId: string;
  onSuccess: (newCase: InspectionCase) => void;
}

export const NewInspectionModal: React.FC<NewInspectionModalProps> = ({
  isOpen,
  onClose,
  defaultCircleId,
  onSuccess,
}) => {
  const [productName, setProductName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [manufacturerName, setManufacturerName] = useState("");
  const [establishmentName, setEstablishmentName] = useState("");
  const [premisesAddress, setPremisesAddress] = useState("");
  const [category, setCategory] = useState("FOOD_SNACKS");
  const [packageType, setPackageType] = useState<PackagingType>("RECTANGULAR");
  const [inspectionType, setInspectionType] = useState<InspectionType>("ROUTINE_MARKET_SURVEILLANCE");
  const [declaredNetQty, setDeclaredNetQty] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setProductName("");
    setBrandName("");
    setManufacturerName("");
    setEstablishmentName("");
    setPremisesAddress("");
    setCategory("FOOD_SNACKS");
    setPackageType("RECTANGULAR");
    setInspectionType("ROUTINE_MARKET_SURVEILLANCE");
    setDeclaredNetQty("");
    setNotes("");
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!productName.trim()) {
      setErrorMessage("Commodity / product name is required under Rule 6(1)(a).");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateInspectionPayload = {
        product_name: productName.trim(),
        brand_name: brandName.trim() || undefined,
        manufacturer_name: manufacturerName.trim() || undefined,
        establishment_name: establishmentName.trim() || undefined,
        premises_address: premisesAddress.trim() || undefined,
        category,
        package_type: packageType,
        inspection_type: inspectionType,
        jurisdiction_circle_id: defaultCircleId,
        declared_net_quantity: declaredNetQty.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const newCase = await ApiService.createInspection(payload);
      resetForm();
      onSuccess(newCase);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to register inspection case. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Register New Inspection Case"
      subtitle="Initializes a statutory case file under Section 15 of Legal Metrology Act, 2009"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div
            role="alert"
            className="p-3 bg-verdictFail-light border border-verdictFail-dark/30 rounded-md text-xs text-verdictFail-dark flex items-start gap-2"
          >
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <span className="font-bold">Validation Error: </span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Section 1: Commodity Particulars */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-govNavy">
            1. Packaged Commodity Particulars (Rule 6 Declarations)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label htmlFor="product-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Commodity / Product Name <span className="text-rose-600">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Premium Whole Wheat Atta 5kg"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-govNavy bg-white"
                required
              />
            </div>

            <div>
              <label htmlFor="brand-name" className="block text-xs font-medium text-slate-700 mb-1">
                Brand Name
              </label>
              <input
                id="brand-name"
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g., Annapurna"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-govNavy bg-white"
              />
            </div>

            <div>
              <label htmlFor="declared-qty" className="block text-xs font-medium text-slate-700 mb-1">
                Declared Net Quantity (on pack)
              </label>
              <input
                id="declared-qty"
                type="text"
                value={declaredNetQty}
                onChange={(e) => setDeclaredNetQty(e.target.value)}
                placeholder="e.g., 5 kg or 200 g"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-govNavy bg-white"
              />
            </div>

            <div>
              <label htmlFor="category-select" className="block text-xs font-medium text-slate-700 mb-1">
                Commodity Category
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-govNavy bg-white"
              >
                <option value="FOOD_SNACKS">Food & Processed Snacks</option>
                <option value="BEVERAGES">Beverages & Bottled Liquids</option>
                <option value="COSMETICS">Cosmetics & Personal Care</option>
                <option value="COMMODITY_GOODS">General Packaged Goods</option>
                <option value="ELECTRONICS_COMMODITY">Electronic Commodities</option>
              </select>
            </div>

            <div>
              <label htmlFor="pkg-type-select" className="block text-xs font-medium text-slate-700 mb-1">
                Packaging Geometry
              </label>
              <select
                id="pkg-type-select"
                value={packageType}
                onChange={(e) => setPackageType(e.target.value as PackagingType)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-govNavy bg-white"
              >
                <option value="RECTANGULAR">Rectangular Carton / Box (H × W)</option>
                <option value="CYLINDRICAL">Cylindrical Bottle / Can (40% of H × C)</option>
                <option value="FLEXIBLE_POUCH">Flexible Pouch / Pillow Pack (50% of H × W)</option>
                <option value="UNSPECIFIED">Other / Unspecified</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Inspection Site & Legal Entity */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-govNavy">
            2. Inspection Site & Legal Entity (Premises Audited)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="establishment-name" className="block text-xs font-medium text-slate-700 mb-1">
                Establishment / Trader Name
              </label>
              <input
                id="establishment-name"
                type="text"
                value={establishmentName}
                onChange={(e) => setEstablishmentName(e.target.value)}
                placeholder="e.g., Gupta Mega Retail Store"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-govNavy bg-white"
              />
            </div>

            <div>
              <label htmlFor="insp-type-select" className="block text-xs font-medium text-slate-700 mb-1">
                Inspection Operation Type
              </label>
              <select
                id="insp-type-select"
                value={inspectionType}
                onChange={(e) => setInspectionType(e.target.value as InspectionType)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-govNavy bg-white"
              >
                <option value="ROUTINE_MARKET_SURVEILLANCE">Routine Market Surveillance</option>
                <option value="COMPLAINT_VERIFICATION">Consumer / NCH Complaint Verification</option>
                <option value="MANUFACTURER_PACKER_DEPOT">Manufacturer / Packer Depot Audit</option>
                <option value="SURPRISE_ENFORCEMENT_RAID">Surprise Enforcement Raid</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="premises-address" className="block text-xs font-medium text-slate-700 mb-1">
                Premises Address / Market Location
              </label>
              <input
                id="premises-address"
                type="text"
                value={premisesAddress}
                onChange={(e) => setPremisesAddress(e.target.value)}
                placeholder="e.g., Shop 4, Main Market, Kalkaji, New Delhi 110019"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-govNavy bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Field Notes */}
        <div>
          <label htmlFor="field-notes" className="block text-xs font-medium text-slate-700 mb-1">
            Officer Preliminary Notes / Seizure Context (Optional)
          </label>
          <textarea
            id="field-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Sample drawn from shelf display. ArUco 50mm fiducial placed alongside PDP front label."
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-govNavy bg-white"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-govNavy hover:bg-govNavy-light rounded-md shadow focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Creating Case Record...
              </>
            ) : (
              "Initialize Case Record"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
