from memory.hindsight import client, BANK_ID


def test_hindsight_memory():

    print("\n========== RECALLOPS MEMORY TEST ==========\n")

    # Sample production incident
    incident = """
    Incident ID: INC-001

    Service: Payment Service

    Problem: Database connection timeout.

    Symptoms:
    The payment service failed to connect to
    the PostgreSQL database.

    Root Cause:
    The database connection pool was exhausted.

    Resolution:
    Increased the connection pool limit and
    restarted the payment service.

    Outcome:
    The service recovered successfully.
    """

    # STEP 1: RETAIN
    print("STEP 1: Storing incident in Hindsight...")

    client.retain(
        bank_id=BANK_ID,
        content=incident
    )

    print("Incident stored successfully!")

    # STEP 2: RECALL
    print("\nSTEP 2: Retrieving previous incident...")

    result = client.recall(
        bank_id=BANK_ID,
        query="What happened when the payment service database connection timed out?"
    )

    print("\nRetrieved memories:")

    if result.results:
        for memory in result.results:
            print("\n", memory.text)
    else:
        print("No matching memories found.")

    # STEP 3: REFLECT
    print("\nSTEP 3: Generating an answer from memory...")

    response = client.reflect(
        bank_id=BANK_ID,
        query="What was the root cause of the payment service failure and how was it resolved?"
    )

    print("\nRECALLOPS AI RESPONSE:")
    print(response.text)

    print("\n========== TEST COMPLETED ==========")

    client.close()


if __name__ == "__main__":
    test_hindsight_memory()