function createClient() {
  if (
    !window.SUPABASE_URL ||
    !window.SUPABASE_ANON_KEY ||
    window.SUPABASE_ANON_KEY.includes("REPLACE")
  ) {
    return null;
  }
  return window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY,
  );
}

const db = {
  client: null,

  init() {
    this.client = createClient();
    return this.client;
  },

  async listVehicles() {
    const { data, error } = await this.client
      .from("vehicles")
      .select("*, expenses(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((v) => ({
      ...v,
      expenses: [...(v.expenses || [])].sort((a, b) =>
        (b.date || "").localeCompare(a.date || ""),
      ),
    }));
  },

  async getVehicle(id) {
    const { data, error } = await this.client
      .from("vehicles")
      .select("*, expenses(*)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return {
      ...data,
      expenses: [...(data.expenses || [])].sort((a, b) =>
        (b.date || "").localeCompare(a.date || ""),
      ),
    };
  },

  async createVehicle(payload) {
    const { data, error } = await this.client
      .from("vehicles")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateVehicle(id, payload) {
    const { data, error } = await this.client
      .from("vehicles")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteVehicle(id) {
    const { error } = await this.client.from("vehicles").delete().eq("id", id);
    if (error) throw error;
  },

  async addExpense(payload) {
    const { data, error } = await this.client
      .from("expenses")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteExpense(id) {
    const { error } = await this.client.from("expenses").delete().eq("id", id);
    if (error) throw error;
  },

  async uploadFile(bucket, path, file) {
    const { error } = await this.client.storage.from(bucket).upload(path, file, {
      upsert: true,
      contentType: file.type || undefined,
    });
    if (error) throw error;
    const { data } = this.client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  async uploadVehiclePhoto(vehicleId, file) {
    const path = `${vehicleId}/photo-${Date.now()}.${fileExt(file)}`;
    return this.uploadFile("vehicle-photos", path, file);
  },

  async uploadExpenseReceipt(vehicleId, file) {
    const path = `${vehicleId}/receipt-${Date.now()}.${fileExt(file)}`;
    return this.uploadFile("expense-receipts", path, file);
  },
};
